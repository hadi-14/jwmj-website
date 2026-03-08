import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';

const RESET_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        // Validate input
        if (!email) {
            return NextResponse.json(
                { message: 'Email is required' },
                { status: 400 }
            );
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true, name: true },
        });

        if (!user) {
            // Don't reveal if email exists or not for security
            return NextResponse.json({
                message: 'If an account with that email exists, a password reset link has been sent.',
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY);

        // Delete any existing unused tokens for this email
        await prisma.passwordResetToken.deleteMany({
            where: {
                email,
                used: false,
            },
        });

        // Create new reset token
        await prisma.passwordResetToken.create({
            data: {
                email,
                token: resetToken,
                expiresAt,
            },
        });

        // Send password reset email
        try {
            await sendPasswordResetEmail(email, resetToken, user.name || 'User');
        } catch (emailError) {
            console.error('Error sending password reset email:', emailError);
            return NextResponse.json(
                { message: 'Failed to send password reset email. Please try again.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: 'If an account with that email exists, a password reset link has been sent.',
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}