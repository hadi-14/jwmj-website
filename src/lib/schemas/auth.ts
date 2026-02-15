import { z } from 'zod';

// CNIC validation - Pakistani CNIC format: XXXXX-XXXXXXX-X
export const cnicSchema = z.string()
  .regex(/^\d{5}-?\d{7}-?\d{1}$/, 'Invalid CNIC format. Use: XXXXX-XXXXXXX-X')
  .transform(val => val.replace(/-/g, ''));

// Phone number validation - Pakistani phone format
export const phoneSchema = z.string()
  .regex(/^(\+92|0)?3\d{9}$/, 'Invalid phone number. Use: 03XXXXXXXXX or +923XXXXXXXXX')
  .transform(val => val.replace(/\D/g, ''));

// Email validation
export const emailSchema = z.string()
  .email('Invalid email address')
  .toLowerCase()
  .trim();

// Password validation with strength requirements
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

// Membership number validation
export const membershipNoSchema = z.string()
  .min(1, 'Membership number is required')
  .max(50, 'Membership number is too long')
  .trim();

// Verification code validation
export const verificationCodeSchema = z.string()
  .length(6, 'Verification code must be 6 digits')
  .regex(/^\d{6}$/, 'Verification code must contain only numbers');

// Member verification schemas
export const memberVerificationSchema = z.object({
  verificationMethod: z.enum(['membership', 'cnic']),
  membershipNo: membershipNoSchema.optional(),
  cnic: cnicSchema.optional(),
  email: emailSchema,
  phone: phoneSchema,
}).refine(
  (data) => {
    // If membership method is selected, require membership number
    if (data.verificationMethod === 'membership') {
      return !!data.membershipNo && data.membershipNo.length > 0;
    }
    // If CNIC method is selected, require CNIC
    if (data.verificationMethod === 'cnic') {
      return !!data.cnic && data.cnic.length > 0;
    }
    return false;
  },
  {
    message: 'Please provide the required verification information',
    path: ['verificationMethod']
  }
).refine(
  (data) => {
    // Additional check for membership number
    if (data.verificationMethod === 'membership' && !data.membershipNo) {
      return false;
    }
    return true;
  },
  {
    message: 'Membership number is required when using membership verification',
    path: ['membershipNo']
  }
).refine(
  (data) => {
    // Additional check for CNIC
    if (data.verificationMethod === 'cnic' && !data.cnic) {
      return false;
    }
    return true;
  },
  {
    message: 'CNIC is required when using CNIC verification',
    path: ['cnic']
  }
);

// Email verification schemas
export const sendVerificationSchema = z.object({
  email: emailSchema,
});

export const verifyEmailSchema = z.object({
  email: emailSchema,
  code: verificationCodeSchema,
});

// Registration schema
export const registrationSchema = z.object({
  memberComputerId: z.string().min(1, 'Member ID is required'),
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  confirmPassword: z.string().optional(),
}).refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Export types
export type MemberVerificationInput = z.infer<typeof memberVerificationSchema>;
export type SendVerificationInput = z.infer<typeof sendVerificationSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;