import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailSchema } from '@/lib/schemas/auth';
import { ZodError } from 'zod';
import {
  getVerificationCode,
  incrementVerificationAttempts,
  deleteVerificationCode,
  MAX_VERIFICATION_ATTEMPTS
} from '@/lib/verification-db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = verifyEmailSchema.parse(body);
    const { email, code } = validatedData;

    const storedData = await getVerificationCode(email);

    if (!storedData) {
      return NextResponse.json(
        {
          message: 'No verification code found. Please request a new code.',
          errors: { code: 'Code not found or expired' }
        },
        { status: 400 }
      );
    }

    // Check verification attempts
    if (storedData.verificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
      await deleteVerificationCode(email);
      return NextResponse.json(
        {
          message: 'Too many verification attempts. Please request a new code.',
          errors: { code: 'Maximum attempts exceeded' }
        },
        { status: 400 }
      );
    }

    // Check if code expired
    if (new Date() > storedData.expiresAt) {
      await deleteVerificationCode(email);
      return NextResponse.json(
        {
          message: 'Verification code has expired. Please request a new code.',
          errors: { code: 'Code expired' }
        },
        { status: 400 }
      );
    }

    // Check if code matches
    if (storedData.code !== code) {
      await incrementVerificationAttempts(email);
      const remainingAttempts = MAX_VERIFICATION_ATTEMPTS - storedData.verificationAttempts - 1;
      
      return NextResponse.json(
        {
          message: `Invalid verification code. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`,
          errors: { code: 'Invalid code' }
        },
        { status: 400 }
      );
    }

    // Code is valid - remove it
    await deleteVerificationCode(email);

    return NextResponse.json({
      message: 'Email verified successfully',
      verified: true
    });
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

    console.error('Error verifying email:', error);
    return NextResponse.json(
      {
        message: 'An error occurred during verification.',
        errors: { server: 'Internal server error' }
      },
      { status: 500 }
    );
  }
}