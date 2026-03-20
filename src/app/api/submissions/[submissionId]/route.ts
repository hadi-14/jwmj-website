import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { Schemas } from '@/lib/schemas/form.schema';
import { requireAuth, requireAdmin, logSecurityEvent } from '@/lib/auth';

// Validate UUID format
function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// GET: Fetch single submission - requires authentication
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ submissionId: string }> }
) {
  const params = await props.params;
  try {
    // Require authentication
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    if (!isValidUUID(params.submissionId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid submission ID format' },
        { status: 400 }
      );
    }

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

    // Members can only view their own submissions
    if (authResult.user.role === 'MEMBER') {
      if (submission.submittedBy !== authResult.user.email && 
          submission.submittedBy !== authResult.user.userId) {
        return NextResponse.json(
          { success: false, error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    const validatedSubmission = Schemas.FormSubmission.parse(submission);

    return NextResponse.json({
      success: true,
      data: validatedSubmission
    });
  } catch (error: unknown) {
    console.error('GET /api/submissions/[submissionId] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submission' },
      { status: 500 }
    );
  }
}

// PATCH: Update submission - admin only
export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ submissionId: string }> }
) {
  const params = await props.params;
  try {
    // Require admin authentication
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    if (!isValidUUID(params.submissionId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid submission ID format' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { status, notes, fieldValues } = body;

    // Validate update data
    Schemas.UpdateFormSubmission.parse(body);

    // Validate status if provided
    if (status && !['pending', 'approved', 'rejected', 'draft'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    const updateData: {
      status?: string;
      notes?: string;
      approvedBy?: string;
      approvedDate?: Date | null;
    } = {};
    
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (status === 'approved' || status === 'rejected') {
      updateData.approvedBy = authResult.user.email;
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
    await prisma.formAuditLog.create({
      data: {
        submissionId: params.submissionId,
        action: status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'updated',
        changedBy: authResult.user.email,
        changes: JSON.stringify({ status, notes, updatedFields: fieldValues ? Object.keys(fieldValues) : [] }),
        ipAddress: req.headers.get('x-forwarded-for') || undefined
      }
    });

    await logSecurityEvent('SUBMISSION_UPDATED', authResult.user.userId, { 
      submissionId: params.submissionId, 
      status 
    }, req);

    const validatedSubmission = Schemas.FormSubmission.parse(submission);

    return NextResponse.json({
      success: true,
      data: validatedSubmission,
      message: 'Submission updated successfully'
    });
  } catch (error: unknown) {
    console.error('PATCH /api/submissions/[submissionId] error:', error);

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

// DELETE: Delete submission (soft delete) - admin only
export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ submissionId: string }> }
) {
  const params = await props.params;
  try {
    // Require admin authentication
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    if (!isValidUUID(params.submissionId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid submission ID format' },
        { status: 400 }
      );
    }

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
        changedBy: authResult.user.email,
        ipAddress: req.headers.get('x-forwarded-for') || undefined
      }
    });

    await logSecurityEvent('SUBMISSION_DELETED', authResult.user.userId, { 
      submissionId: params.submissionId 
    }, req);

    return NextResponse.json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (error: unknown) {
    console.error('DELETE /api/submissions/[submissionId] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete submission' },
      { status: 500 }
    );
  }
}
