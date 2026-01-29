import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Decimal } from 'decimal.js';
import { memberVerificationSchema } from '@/lib/schemas/auth';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = memberVerificationSchema.parse(body);

    const { verificationMethod, membershipNo, cnic, email, phone } = validatedData;

    let member = null;

    // Search by membership number
    if (verificationMethod === 'membership' && membershipNo) {
      member = await prisma.member_Information.findFirst({
        where: {
          MemMembershipNo: membershipNo,
          Mem_DeActive: false, // Only active members
        },
        include: {
          maritalStatus: {
            orderBy: { MMr_StatusDate: 'desc' },
            take: 1,
            include: { maritalStatus: true }
          },
          occupations: {
            orderBy: { MOc_statusDate: 'desc' },
            take: 1,
            include: { occupation: true }
          },
          qualifications: {
            orderBy: { MQu_StatusDate: 'desc' },
            take: 1,
            include: { qualification: true }
          },
          emails: {
            take: 1
          },
          cellNumbers: {
            take: 5
          }
        }
      });
    }

    // Search by CNIC
    if (verificationMethod === 'cnic' && cnic) {
      const cnicDecimal = new Decimal(cnic);
      member = await prisma.member_Information.findFirst({
        where: {
          MemCNIC: cnicDecimal,
          Mem_DeActive: false,
        },
        include: {
          maritalStatus: {
            orderBy: { MMr_StatusDate: 'desc' },
            take: 1,
            include: { maritalStatus: true }
          },
          occupations: {
            orderBy: { MOc_statusDate: 'desc' },
            take: 1,
            include: { occupation: true }
          },
          qualifications: {
            orderBy: { MQu_StatusDate: 'desc' },
            take: 1,
            include: { qualification: true }
          },
          emails: {
            take: 1
          },
          cellNumbers: {
            take: 5
          }
        }
      });
    }

    if (!member) {
      return NextResponse.json(
        {
          message: 'Member not found. Please check your details and try again.',
          errors: { verification: 'No member found with the provided information' }
        },
        { status: 404 }
      );
    }

    // Check if member is deceased
    if (member.Mem_DeceasedDate) {
      return NextResponse.json(
        {
          message: 'Cannot create account for deceased member.',
          errors: { verification: 'Member is marked as deceased' }
        },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email
      }
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: 'An account with this email already exists. Please login instead.',
          errors: { email: 'Email already registered' }
        },
        { status: 400 }
      );
    }

    // Check if this member already has an account
    const memberHasAccount = await prisma.user.findFirst({
      where: {
        name: member.MemComputerID.toString()
      }
    });

    if (memberHasAccount) {
      return NextResponse.json(
        {
          message: 'This member already has an account. Please use the login page or contact support.',
          errors: { verification: 'Member already registered' }
        },
        { status: 400 }
      );
    }

    // Return member data for confirmation
    const response = {
      MemComputerID: member.MemComputerID.toString(),
      MemWehvariaNo: member.MemWehvariaNo?.toString(),
      MemMembershipNo: member.MemMembershipNo,
      MemName: member.MemName,
      MemFatherName: member.MemFatherName,
      MemMotherName: member.MemMotherName,
      MemCNIC: member.MemCNIC?.toString(),
      MemDOB: member.MemDOB,
      MemRegistrationDate: member.MemRegistrationDate,
      MemPostalAddress: member.MemPostalAddress,
    };

    return NextResponse.json(response);
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

    console.error('Error verifying member:', error);
    return NextResponse.json(
      {
        message: 'An error occurred while verifying member details.',
        errors: { server: 'Internal server error' }
      },
      { status: 500 }
    );
  }
}