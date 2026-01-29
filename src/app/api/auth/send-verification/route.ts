import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationSchema } from '@/lib/schemas/auth';
import { ZodError } from 'zod';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';
import {
  createOrUpdateVerificationCode,
  checkRateLimit
} from '@/lib/verification-db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = sendVerificationSchema.parse(body);
    const { email } = validatedData;

    // Check rate limiting
    const rateLimitCheck = await checkRateLimit(email);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          message: `Too many requests. Please try again in ${rateLimitCheck.waitMinutes} minute${rateLimitCheck.waitMinutes! > 1 ? 's' : ''}.`,
          errors: { rateLimit: 'Rate limit exceeded' }
        },
        { status: 429 }
      );
    }

    // Generate 6-digit verification code
    const code = crypto.randomInt(100000, 999999).toString();

    // Store code in database
    await createOrUpdateVerificationCode(email, code);

    // Send email
    try {
      await sendVerificationEmail(email, code);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      return NextResponse.json(
        {
          message: 'Failed to send verification email. Please try again.',
          errors: { email: 'Email delivery failed' }
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Verification code sent successfully',
      expiresIn: 600,
      ...(process.env.NODE_ENV === 'development' && { debug: { code } })
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

    console.error('Error sending verification code:', error);
    return NextResponse.json(
      {
        message: 'An error occurred while sending verification code.',
        errors: { server: 'Internal server error' }
      },
      { status: 500 }
    );
  }
}