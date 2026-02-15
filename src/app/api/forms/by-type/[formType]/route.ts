import { prisma } from "@/lib/prisma";
import { Schemas } from "@/lib/schemas/form.schema";
import { NextRequest, NextResponse } from "next/server";

// GET /api/forms/by-type/[formType]
// Fetch form by type
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formType: string }> }
) {
  try {
    const { formType } = await params;
    // Silence unused request warning
    void request;

    const form = await prisma.form.findFirst({
      where: {
        formType: formType,
        isActive: true,
      },
      include: {
        fields: {
          orderBy: { fieldOrder: "asc" },
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
      fields: form.fields.map((field) => ({
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
    console.error("GET /api/forms/by-type/[formType] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch form" },
      { status: 500 }
    );
  }
}
