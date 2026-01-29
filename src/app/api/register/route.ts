import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Decimal } from 'decimal.js';

export async function POST(request: NextRequest) {
  try {
    const { memberComputerId, email, phone, password } = await request.json();

    // Validate input
    if (!memberComputerId || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Verify member exists
    const member = await prisma.member_Information.findUnique({
      where: { MemComputerID: new Decimal(memberComputerId) }
    });

    if (!member) {
      return NextResponse.json(
        { message: 'Member not found' },
        { status: 404 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user account
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: memberComputerId, // Store member ID as name for linking
        password: hashedPassword,
        role: 'MEMBER'
      }
    });

    // Optionally update member email if not already set
    const memberEmail = await prisma.member_Emailid.findFirst({
      where: { MEM_MemComputerID: new Decimal(memberComputerId) }
    });

    if (!memberEmail) {
      await prisma.member_Emailid.create({
        data: {
          MEM_MemComputerID: new Decimal(memberComputerId),
          MEM_MemWehvariaNo: member.MemWehvariaNo || new Decimal(0),
          MEM_Emailid: email
        }
      });
    }

    // Optionally update member phone if provided and not already set
    if (phone) {
      const memberPhone = await prisma.member_CellNumber.findFirst({
        where: { MCL_MemComputerid: new Decimal(memberComputerId) }
      });

      if (!memberPhone) {
        try {
          const phoneDecimal = new Decimal(phone.replace(/\D/g, ''));
          await prisma.member_CellNumber.create({
            data: {
              MCL_MemComputerid: new Decimal(memberComputerId),
              MCL_MemWehvariaNo: member.MemWehvariaNo || new Decimal(0),
              MCL_CellNumber: phoneDecimal
            }
          });
        } catch (err) {
          console.error('Error saving phone number:', err);
        }
      }
    }

    return NextResponse.json({
      message: 'Account created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json(
      { message: 'An error occurred while creating your account' },
      { status: 500 }
    );
  }
}