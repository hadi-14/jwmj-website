import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Decimal } from 'decimal.js';
import { registrationSchema } from '@/lib/schemas/auth';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
    try {
        // Parse and validate request body
        const body = await request.json();
        const validatedData = registrationSchema.parse(body);
        const { memberComputerId, email, phone, password } = validatedData;

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json(
                {
                    message: 'An account with this email already exists.',
                    errors: { email: 'Email already registered' }
                },
                { status: 400 }
            );
        }

        // Verify member exists and is active
        const member = await prisma.member_Information.findUnique({
            where: { MemComputerID: new Decimal(memberComputerId) }
        });

        if (!member) {
            return NextResponse.json(
                {
                    message: 'Member not found. Please start the registration process again.',
                    errors: { member: 'Invalid member ID' }
                },
                { status: 404 }
            );
        }

        if (member.Mem_DeActive) {
            return NextResponse.json(
                {
                    message: 'This member account is deactivated. Please contact support.',
                    errors: { member: 'Member account is deactivated' }
                },
                { status: 400 }
            );
        }

        if (member.Mem_DeceasedDate) {
            return NextResponse.json(
                {
                    message: 'Cannot create account for deceased member.',
                    errors: { member: 'Member is deceased' }
                },
                { status: 400 }
            );
        }

        // Hash password with bcrypt (10 rounds)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user account in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create user
            const user = await tx.user.create({
                data: {
                    email,
                    name: memberComputerId,
                    password: hashedPassword,
                    role: 'MEMBER'
                }
            });

            // Update/create member email if not already set
            const memberEmail = await tx.member_Emailid.findFirst({
                where: { MEM_MemComputerID: new Decimal(memberComputerId) }
            });

            if (!memberEmail) {
                await tx.member_Emailid.create({
                    data: {
                        MEM_MemComputerID: new Decimal(memberComputerId),
                        MEM_MemWehvariaNo: member.MemWehvariaNo || new Decimal(0),
                        MEM_Emailid: email
                    }
                });
            } else if (memberEmail.MEM_Emailid !== email) {
                // Delete old email record and create new one (since email is part of the composite key)
                await tx.member_Emailid.delete({
                    where: {
                        MEM_MemComputerID_MEM_Emailid: {
                            MEM_MemComputerID: new Decimal(memberComputerId),
                            MEM_Emailid: memberEmail.MEM_Emailid
                        }
                    }
                });
                
                await tx.member_Emailid.create({
                    data: {
                        MEM_MemComputerID: new Decimal(memberComputerId),
                        MEM_MemWehvariaNo: member.MemWehvariaNo || new Decimal(0),
                        MEM_Emailid: email
                    }
                });
            }

            // Update/create member phone if provided
            try {
                const phoneDecimal = new Decimal(phone);
                const memberPhone = await tx.member_CellNumber.findFirst({
                    where: {
                        MCL_MemComputerid: new Decimal(memberComputerId),
                        MCL_CellNumber: phoneDecimal
                    }
                });

                if (!memberPhone) {
                    await tx.member_CellNumber.create({
                        data: {
                            MCL_MemComputerid: new Decimal(memberComputerId),
                            MCL_MemWehvariaNo: member.MemWehvariaNo || new Decimal(0),
                            MCL_CellNumber: phoneDecimal
                        }
                    });
                }
            } catch (phoneError) {
                console.error('Error saving phone number:', phoneError);
                // Don't fail the whole transaction if phone save fails
            }

            return user;
        });

        return NextResponse.json({
            message: 'Account created successfully! You can now login.',
            user: {
                id: result.id,
                email: result.email,
                memberComputerId: result.name
            }
        }, { status: 201 });
    } catch (error) {
        if (error instanceof ZodError) {
            const formattedErrors = error.issues.reduce((acc, err) => {
                const path = err.path.join('.');
                acc[path] = err.message;
                return acc;
            }, {} as Record<string, string>);

            return NextResponse.json(
                {
                    message: 'Validation failed. Please check your input.',
                    errors: formattedErrors
                },
                { status: 400 }
            );
        }

        console.error('Error creating account:', error);
        return NextResponse.json(
            {
                message: 'An error occurred while creating your account. Please try again.',
                errors: { server: 'Internal server error' }
            },
            { status: 500 }
        );
    }
}