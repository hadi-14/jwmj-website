'use server';

import { prisma } from '@/lib/prisma';
import { ZakatApplicationFormData, FormActionResponse } from '@/types/forms';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Validation schema
const zakatSchema = z.object({
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
  maritalStatus: z.enum(['married', 'unmarried', 'widow', 'divorced']),
  residentialStatus: z.enum(['owned', 'rented', 'lease']),
  parentsLivingWithYou: z.boolean(),
  declarationAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the declaration',
  }),
});

export async function createZakatApplication(
  data: ZakatApplicationFormData
): Promise<FormActionResponse> {
  try {
    // Validate data
    const validated = zakatSchema.parse(data);

    // Create application
    const application = await prisma.zakatApplication.create({
      data: {
        ...data,
        status: 'pending',
      },
    });

    revalidatePath('/applications/zakat');

    return {
      success: true,
      message: 'Zakat application submitted successfully',
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

    console.error('Error creating zakat application:', error);
    return {
      success: false,
      message: error.message || 'Failed to submit application',
    };
  }
}

export async function updateZakatApplication(
  id: string,
  data: Partial<ZakatApplicationFormData>
): Promise<FormActionResponse> {
  try {
    const application = await prisma.zakatApplication.update({
      where: { id },
      data,
    });

    revalidatePath('/applications/zakat');
    revalidatePath(`/applications/zakat/${id}`);

    return {
      success: true,
      message: 'Application updated successfully',
      data: application,
    };
  } catch (error: any) {
    console.error('Error updating zakat application:', error);
    return {
      success: false,
      message: error.message || 'Failed to update application',
    };
  }
}

export async function deleteZakatApplication(
  id: string
): Promise<FormActionResponse> {
  try {
    await prisma.zakatApplication.delete({
      where: { id },
    });

    revalidatePath('/applications/zakat');

    return {
      success: true,
      message: 'Application deleted successfully',
    };
  } catch (error: any) {
    console.error('Error deleting zakat application:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete application',
    };
  }
}

export async function updateZakatApplicationStatus(
  id: string,
  status: 'pending' | 'approved' | 'rejected',
  approvedAmount?: number,
  remarks?: string
): Promise<FormActionResponse> {
  try {
    const application = await prisma.zakatApplication.update({
      where: { id },
      data: {
        status,
        approvedAmount: approvedAmount ? Number(approvedAmount) : undefined,
        remarks,
      },
    });

    revalidatePath('/applications/zakat');
    revalidatePath(`/applications/zakat/${id}`);

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