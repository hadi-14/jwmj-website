import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json();

        // Validate input
        if (!token || !password) {
            return NextResponse.json(
                { message: 'Token and password are required' },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { message: 'Password must be at least 8 characters long' },
                { status: 400 }
            );
        }

        // Find the reset token
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
        });

        if (!resetToken) {
            return NextResponse.json(
                { message: 'Invalid or expired reset token' },
                { status: 400 }
            );
        }

        // Check if token is expired
        if (resetToken.expiresAt < new Date()) {
            return NextResponse.json(
                { message: 'Reset token has expired' },
                { status: 400 }
            );
        }

        // Check if token has been used
        if (resetToken.used) {
            return NextResponse.json(
                { message: 'Reset token has already been used' },
                { status: 400 }
            );
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Update user password
        await prisma.user.update({
            where: { email: resetToken.email },
            data: { password: hashedPassword },
        });

        // Mark token as used
        await prisma.passwordResetToken.update({
            where: { token },
            data: { used: true },
        });

        // Delete all unused tokens for this email (cleanup)
        await prisma.passwordResetToken.deleteMany({
            where: {
                email: resetToken.email,
                used: false,
            },
        });

        return NextResponse.json({
            message: 'Password reset successfully',
        });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}