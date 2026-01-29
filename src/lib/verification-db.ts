import { prisma } from '@/lib/prisma';

export const MAX_VERIFICATION_ATTEMPTS = 5;
export const RATE_LIMIT = 30;
export const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
export const CODE_EXPIRY = 10 * 60 * 1000; // 10 minutes

export async function createOrUpdateVerificationCode(
  email: string,
  code: string
) {
  const expiresAt = new Date(Date.now() + CODE_EXPIRY);
  
  // Delete expired codes first
  await prisma.verificationCode.deleteMany({
    where: {
      expiresAt: {
        lt: new Date()
      }
    }
  });

  const existing = await prisma.verificationCode.findUnique({
    where: { email }
  });

  if (existing) {
    return await prisma.verificationCode.update({
      where: { email },
      data: {
        code,
        expiresAt,
        attempts: existing.attempts + 1,
        verificationAttempts: 0, // Reset verification attempts
        lastAttempt: new Date()
      }
    });
  }

  return await prisma.verificationCode.create({
    data: {
      email,
      code,
      expiresAt,
      attempts: 1,
      lastAttempt: new Date()
    }
  });
}

export async function getVerificationCode(email: string) {
  return await prisma.verificationCode.findUnique({
    where: { email }
  });
}

export async function incrementVerificationAttempts(email: string) {
  return await prisma.verificationCode.update({
    where: { email },
    data: {
      verificationAttempts: {
        increment: 1
      }
    }
  });
}

export async function deleteVerificationCode(email: string) {
  return await prisma.verificationCode.delete({
    where: { email }
  }).catch(() => null); // Ignore if doesn't exist
}

export async function checkRateLimit(email: string) {
  const record = await getVerificationCode(email);
  
  if (!record) return { allowed: true };

  const timeSinceLastAttempt = Date.now() - record.lastAttempt.getTime();

  if (timeSinceLastAttempt < RATE_LIMIT_WINDOW && record.attempts >= RATE_LIMIT) {
    const waitMinutes = Math.ceil((RATE_LIMIT_WINDOW - timeSinceLastAttempt) / 60000);
    return {
      allowed: false,
      waitMinutes
    };
  }

  return { allowed: true };
}