import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { Schemas } from '@/lib/schemas/form.schema';

// GET: Fetch single submission
export async function GET(
  req: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  try {
    const submission = await prisma.formSubmission.findUnique({
      where: { id: params.submissionId },
      include: {
        form: {
          include: {
            fields: { orderBy: { fieldOrder: 'asc' } }
          }
        },
        fieldValues: {
          include: {
            field: true
          }
        }
      }
    });

    if (!submission || submission.isDeleted) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Validate with parsed schema to handle JSON string fields
    const validatedSubmission = Schemas.FormSubmission.parse(submission);

    return NextResponse.json({
      success: true,
      data: validatedSubmission
    });
  } catch (error) {
    console.error('GET /api/submissions/[submissionId] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submission' },
      { status: 500 }
    );
  }
}

// PATCH: Update submission (approve, reject, add notes)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  try {
    const body = await req.json();
    const { status, notes, approvedBy, fieldValues } = body;

    // Validate update data
    const validatedUpdate = Schemas.UpdateFormSubmission.parse(body);

    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes) updateData.notes = notes;
    if (approvedBy) {
      updateData.approvedBy = approvedBy;
      updateData.approvedDate = status === 'approved' ? new Date() : null;
    }

    const submission = await prisma.formSubmission.update({
      where: { id: params.submissionId },
      data: updateData,
      include: {
        form: {
          include: {
            fields: { orderBy: { fieldOrder: 'asc' } }
          }
        },
        fieldValues: { 
          include: { field: true } 
        }
      }
    });

    // Update field values if provided
    if (fieldValues && Object.keys(fieldValues).length > 0) {
      for (const [fieldName, value] of Object.entries(fieldValues)) {
        const field = await prisma.formField.findFirst({
          where: {
            fieldName,
            formId: submission.formId
          }
        });

        if (field) {
          await prisma.formFieldValue.upsert({
            where: {
              submissionId_fieldId: {
                submissionId: params.submissionId,
                fieldId: field.id
              }
            },
            update: { value: String(value) },
            create: {
              submissionId: params.submissionId,
              fieldId: field.id,
              value: String(value)
            }
          });
        }
      }
    }

    // Log audit
    if (status || notes || fieldValues) {
      await prisma.formAuditLog.create({
        data: {
          submissionId: params.submissionId,
          action: status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'updated',
          changedBy: approvedBy || req.headers.get('x-user-email') || 'anonymous',
          changes: JSON.stringify({ status, notes, updatedFields: fieldValues ? Object.keys(fieldValues) : [] }),
          ipAddress: req.headers.get('x-forwarded-for') || req.ip || undefined
        }
      });
    }

    // Validate response with parsed schema
    const validatedSubmission = Schemas.FormSubmission.parse(submission);

    return NextResponse.json({
      success: true,
      data: validatedSubmission,
      message: 'Submission updated successfully'
    });
  } catch (error) {
    console.error('PATCH /api/submissions/[submissionId] error:', error);
    
    // Return validation errors if applicable
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation error',
          message: error.message
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update submission' },
      { status: 500 }
    );
  }
}

// DELETE: Delete submission (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  try {
    // Verify submission exists first
    const submission = await prisma.formSubmission.findUnique({
      where: { id: params.submissionId }
    });

    if (!submission) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    await prisma.formSubmission.update({
      where: { id: params.submissionId },
      data: { isDeleted: true }
    });

    await prisma.formAuditLog.create({
      data: {
        submissionId: params.submissionId,
        action: 'deleted',
        changedBy: req.headers.get('x-user-email') || 'anonymous',
        ipAddress: req.headers.get('x-forwarded-for') || req.ip || undefined
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    console.error('DELETE /api/submissions/[submissionId] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete submission' },
      { status: 500 }
    );
  }
}