'use server';

import { prisma } from '@/lib/prisma';
import { BusinessLoanFormData, FormActionResponse } from '@/types/forms';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Validation schema
const businessLoanSchema = z.object({
  applicantName: z.string().min(1, 'Name is required'),
  fatherOrHusbandName: z.string().min(1, 'Father/Husband name is required'),
  identification: z.string().min(1, 'Identification is required'),
  idCardNumber: z.string().min(13, 'Valid CNIC is required').max(15),
  dateOfBirth: z.date(),
  education: z.string().min(1, 'Education is required'),
  currentAddress: z.string().min(1, 'Address is required'),
  mobileNumber: z.string().min(10, 'Valid mobile number is required'),
  applicationDate: z.date(),
  professionOrSkill: z.string().min(1, 'Profession is required'),
  businessType: z.string().min(1, 'Business type is required'),
  businessDescription: z.string().min(10, 'Business description is required'),
  loanAmount: z.number().min(1, 'Loan amount must be greater than 0'),
  loanPurpose: z.string().min(10, 'Loan purpose is required'),
  guarantor1Name: z.string().min(1, 'Guarantor 1 name is required'),
  guarantor1CNIC: z.string().min(13, 'Valid CNIC is required'),
  guarantor1Contact: z.string().min(10, 'Valid contact is required'),
  guarantor1Relation: z.string().min(1, 'Relation is required'),
});

export async function createBusinessLoanApplication(
  data: BusinessLoanFormData
): Promise<FormActionResponse> {
  try {
    // Validate data
    const validated = businessLoanSchema.parse(data);

    // Create application
    const application = await prisma.businessLoanApplication.create({
      data: {
        ...data,
        status: 'pending',
        loanAmount: Number(data.loanAmount),
        expectedMonthlyProfit: data.expectedMonthlyProfit ? Number(data.expectedMonthlyProfit) : undefined,
        monthlyIncome: data.monthlyIncome ? Number(data.monthlyIncome) : undefined,
        monthlyExpenses: data.monthlyExpenses ? Number(data.monthlyExpenses) : undefined,
        existingLoans: data.existingLoans ? Number(data.existingLoans) : undefined,
      },
    });

    revalidatePath('/applications/business-loan');

    return {
      success: true,
      message: 'Business loan application submitted successfully',
      data: application,
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Validation failed',
        errors: error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    console.error('Error creating business loan application:', error);
    return {
      success: false,
      message: error.message || 'Failed to submit application',
    };
  }
}

export async function updateBusinessLoanApplication(
  id: string,
  data: Partial<BusinessLoanFormData>
): Promise<FormActionResponse> {
  try {
    const application = await prisma.businessLoanApplication.update({
      where: { id },
      data: {
        ...data,
        loanAmount: data.loanAmount ? Number(data.loanAmount) : undefined,
        expectedMonthlyProfit: data.expectedMonthlyProfit ? Number(data.expectedMonthlyProfit) : undefined,
        monthlyIncome: data.monthlyIncome ? Number(data.monthlyIncome) : undefined,
        monthlyExpenses: data.monthlyExpenses ? Number(data.monthlyExpenses) : undefined,
        existingLoans: data.existingLoans ? Number(data.existingLoans) : undefined,
      },
    });

    revalidatePath('/applications/business-loan');
    revalidatePath(`/applications/business-loan/${id}`);

    return {
      success: true,
      message: 'Application updated successfully',
      data: application,
    };
  } catch (error: any) {
    console.error('Error updating business loan application:', error);
    return {
      success: false,
      message: error.message || 'Failed to update application',
    };
  }
}

export async function deleteBusinessLoanApplication(
  id: string
): Promise<FormActionResponse> {
  try {
    await prisma.businessLoanApplication.delete({
      where: { id },
    });

    revalidatePath('/applications/business-loan');

    return {
      success: true,
      message: 'Application deleted successfully',
    };
  } catch (error: any) {
    console.error('Error deleting business loan application:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete application',
    };
  }
}

export async function updateBusinessLoanStatus(
  id: string,
  status: 'pending' | 'approved' | 'rejected' | 'disbursed',
  approvedAmount?: number,
  disbursedAmount?: number,
  disbursementDate?: Date,
  remarks?: string
): Promise<FormActionResponse> {
  try {
    const application = await prisma.businessLoanApplication.update({
      where: { id },
      data: {
        status,
        approvedAmount: approvedAmount ? Number(approvedAmount) : undefined,
        disbursedAmount: disbursedAmount ? Number(disbursedAmount) : undefined,
        disbursementDate,
        remarks,
      },
    });

    revalidatePath('/applications/business-loan');
    revalidatePath(`/applications/business-loan/${id}`);

    return {
      success: true,
      message: `Application ${status} successfully`,
      data: application,
    };
  } catch (error: any) {
    console.error('Error updating application status:', error);
    return {
      success: false,
      message: error.message || 'Failed to update status',
    };
  }
}
