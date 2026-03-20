import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Decimal } from 'decimal.js';
import { registrationSchema } from '@/lib/schemas/auth';
import { ZodError } from 'zod';
import { applyRateLimit, sanitizeEmail, logSecurityEvent } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        // Strict rate limiting for registration: 3 attempts per 5 minutes per IP
        const rateLimitResponse = applyRateLimit(request, 3, 300000);
        if (rateLimitResponse) {
            await logSecurityEvent('REGISTRATION_RATE_LIMITED', null, {}, request);
            return rateLimitResponse;
        }

        // Parse and validate request body
        const body = await request.json();
        const validatedData = registrationSchema.parse(body);
        const { memberComputerId, email, phone, password } = validatedData;

        // Sanitize and validate email
        const sanitizedEmail = sanitizeEmail(email);
        if (!sanitizedEmail) {
            return NextResponse.json(
                {
                    message: 'Invalid email format.',
                    errors: { email: 'Invalid email format' }
                },
                { status: 400 }
            );
        }

        // Validate password strength
        if (password.length < 8) {
            return NextResponse.json(
                {
                    message: 'Password must be at least 8 characters.',
                    errors: { password: 'Password too short' }
                },
                { status: 400 }
            );
        }

        // Validate memberComputerId is a valid number
        const memberIdNum = Number(memberComputerId);
        if (isNaN(memberIdNum) || memberIdNum <= 0) {
            return NextResponse.json(
                {
                    message: 'Invalid member ID format.',
                    errors: { memberComputerId: 'Invalid member ID' }
                },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: sanitizedEmail }
        });

        if (existingUser) {
            // Don't reveal that email exists - security best practice
            await logSecurityEvent('REGISTRATION_DUPLICATE_EMAIL', null, { email: sanitizedEmail }, request);
            return NextResponse.json(
                {
                    message: 'Registration failed. Please try again or contact support.',
                    errors: { email: 'Unable to register with this email' }
                },
                { status: 400 }
            );
        }

        // Verify member exists and is active
        const member = await prisma.member_Information.findUnique({
            where: { MemComputerID: new Decimal(memberComputerId) }
        });

        if (!member) {
            await logSecurityEvent('REGISTRATION_INVALID_MEMBER', null, { memberComputerId }, request);
            return NextResponse.json(
                {
                    message: 'Member not found. Please verify your member ID.',
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
                    message: 'Cannot create account for this member.',
                    errors: { member: 'Unable to create account' }
                },
                { status: 400 }
            );
        }

        // Hash password with bcrypt (12 rounds for better security)
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user account in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create user
            const user = await tx.user.create({
                data: {
                    email: sanitizedEmail,
                    name: member.MemName || 'Member',
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
                        MEM_Emailid: sanitizedEmail
                    }
                });
            } else if (memberEmail.MEM_Emailid !== sanitizedEmail) {
                // Delete old email record and create new one
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
                        MEM_Emailid: sanitizedEmail
                    }
                });
            }

            // Update/create member phone if provided
            if (phone) {
                try {
                    // Sanitize phone number - remove non-digits
                    const cleanPhone = phone.replace(/\D/g, '');
                    if (cleanPhone.length >= 10 && cleanPhone.length <= 15) {
                        const phoneDecimal = new Decimal(cleanPhone);
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
                    }
                } catch (phoneError) {
                    console.error('Error saving phone number:', phoneError);
                }
            }

            return user;
        });

        await logSecurityEvent('REGISTRATION_SUCCESS', result.id, { memberComputerId }, request);

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
