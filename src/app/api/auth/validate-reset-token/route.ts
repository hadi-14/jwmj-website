import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json();

        // Validate input
        if (!token) {
            return NextResponse.json(
                { message: 'Token is required' },
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

        return NextResponse.json({
            message: 'Token is valid',
            valid: true,
        });
    } catch (error) {
        console.error('Validate reset token error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}