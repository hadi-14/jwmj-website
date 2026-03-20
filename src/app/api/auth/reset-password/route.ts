import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { applyRateLimit, logSecurityEvent } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        // Strict rate limiting: 5 attempts per 15 minutes per IP
        const rateLimitResponse = applyRateLimit(request, 5, 900000);
        if (rateLimitResponse) {
            await logSecurityEvent('PASSWORD_RESET_RATE_LIMITED', null, {}, request);
            return rateLimitResponse;
        }

        const { token, password } = await request.json();

        // Validate input
        if (!token || !password) {
            return NextResponse.json(
                { message: 'Token and password are required' },
                { status: 400 }
            );
        }

        // Validate token format (should be alphanumeric)
        if (!/^[a-zA-Z0-9]+$/.test(token) || token.length < 32) {
            await logSecurityEvent('PASSWORD_RESET_INVALID_TOKEN', null, {}, request);
            return NextResponse.json(
                { message: 'Invalid reset token' },
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

        // Check for common password patterns
        const commonPatterns = ['password', '12345678', 'qwerty', 'letmein'];
        if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
            return NextResponse.json(
                { message: 'Password is too common. Please choose a stronger password.' },
                { status: 400 }
            );
        }

        // Find the reset token
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
        });

        if (!resetToken) {
            await logSecurityEvent('PASSWORD_RESET_TOKEN_NOT_FOUND', null, {}, request);
            return NextResponse.json(
                { message: 'Invalid or expired reset token' },
                { status: 400 }
            );
        }

        // Check if token is expired
        if (resetToken.expiresAt < new Date()) {
            await logSecurityEvent('PASSWORD_RESET_TOKEN_EXPIRED', null, { email: resetToken.email }, request);
            return NextResponse.json(
                { message: 'Reset token has expired' },
                { status: 400 }
            );
        }

        // Check if token has been used
        if (resetToken.used) {
            await logSecurityEvent('PASSWORD_RESET_TOKEN_REUSED', null, { email: resetToken.email }, request);
            return NextResponse.json(
                { message: 'Reset token has already been used' },
                { status: 400 }
            );
        }

        // Hash the new password with strong cost factor
        const hashedPassword = await bcrypt.hash(password, 12);

        // Update user password
        const user = await prisma.user.update({
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

        await logSecurityEvent('PASSWORD_RESET_SUCCESS', user.id, {}, request);

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
