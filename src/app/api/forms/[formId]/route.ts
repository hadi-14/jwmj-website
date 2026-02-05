import { prisma } from "@/lib/prisma";
import { Schemas } from "@/lib/schemas/form.schema";
import { NextRequest, NextResponse } from "next/server";
import z, { ZodError } from "zod";

/**
 * GET /api/forms/[formId]
 * Fetch single form by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;

    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: {
        fields: {
          orderBy: { fieldOrder: "asc" },
        },
        submissions: {
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!form) {
      return NextResponse.json(
        { success: false, error: "Form not found" },
        { status: 404 }
      );
    }

    // Transform fields to parse JSON strings
    const transformedForm = {
      ...form,
      fields: form.fields.map((field: any) => ({
        ...field,
        options: field.options ? JSON.parse(field.options) : null,
        validationRule: field.validationRule ? JSON.parse(field.validationRule) : null,
      })),
    };

    const response = Schemas.GetFormResponse.parse({
      success: true,
      data: transformedForm,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/forms/[formId] error:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid form ID" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to fetch form" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/forms/[formId]
 * Update form - PDF fields remain mandatory
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;
    const body = await req.json();

    // Validate request body
    const validatedData = Schemas.UpdateForm.parse(body);

    // Check if trying to remove PDF fields
    if (validatedData.pdfFileUrl === '' || validatedData.pdfFileName === '') {
      return NextResponse.json(
        { 
          success: false, 
          error: "PDF file is mandatory for all forms" 
        },
        { status: 400 }
      );
    }

    const form = await prisma.form.update({
      where: { id: formId },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.description !== undefined && {
          description: validatedData.description,
        }),
        ...(validatedData.isActive !== undefined && {
          isActive: validatedData.isActive,
        }),
        ...(validatedData.pdfFileUrl && { pdfFileUrl: validatedData.pdfFileUrl }),
        ...(validatedData.pdfFileName && { pdfFileName: validatedData.pdfFileName }),
        version: { increment: 1 },
      },
    });

    // Update fields if provided
    if (validatedData.fields) {
      await prisma.formField.deleteMany({
        where: { formId: formId },
      });

      await prisma.formField.createMany({
        data: validatedData.fields.map((field) => ({
          formId: formId,
          fieldName: field.fieldName,
          fieldLabel: field.fieldLabel,
          fieldType: field.fieldType,
          fieldOrder: field.fieldOrder,
          isRequired: field.isRequired,
          isHidden: field.isHidden,
          placeholder: field.placeholder,
          helpText: field.helpText,
          defaultValue: field.defaultValue,
          options: field.options ? JSON.stringify(field.options) : null,
          validationRule: field.validationRule
            ? JSON.stringify(field.validationRule)
            : null,
          columnWidth: field.columnWidth,
        })),
      });
    }

    const updatedForm = await prisma.form.findUnique({
      where: { id: formId },
      include: {
        fields: { orderBy: { fieldOrder: "asc" } },
      },
    });

    const response = Schemas.GetFormResponse.parse({
      success: true,
      data: updatedForm,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("PUT /api/forms/[formId] error:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          message: error.issues[0].message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to update form" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/forms/[formId]
 * Delete form
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;
    const submissionCount = await prisma.formSubmission.count({
      where: { formId: formId },
    });

    if (submissionCount > 0) {
      await prisma.form.update({
        where: { id: formId },
        data: { isActive: false },
      });
    } else {
      await prisma.form.delete({
        where: { id: formId },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Form deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/forms/[formId] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete form" },
      { status: 500 }
    );
  }
}