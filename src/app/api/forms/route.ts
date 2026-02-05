import { prisma } from "@/lib/prisma";
import { Schemas } from "@/lib/schemas/form.schema";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Helper function to transform form data from database format to API format
 * Parses JSON strings for options and validationRule back into objects
 * IMPORTANT: Also includes pdfFileName and pdfFileUrl from the form
 */
function transformFormData(form: any) {
  console.log("Transforming form data:", form);
  return {
    ...form,
    // Keep the PDF file fields at the form level
    pdfFileName: form.pdfFileName,
    pdfFileUrl: form.pdfFileUrl,
    fields: form.fields.map((field: any) => ({
      ...field,
      options: field.options ? JSON.parse(field.options) : null,
      validationRule: field.validationRule ? JSON.parse(field.validationRule) : null,
    })),
  };
}

/**
 * Helper to ensure a value is stringified if it's not already a string
 */
function ensureString(value: any): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

/**
 * GET /api/forms
 * Fetch all forms with pagination
 * Query params: page, limit, formType, isActive
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Validate pagination
    const pagination = Schemas.Pagination.parse({
      page: searchParams.get("page")
        ? parseInt(searchParams.get("page")!)
        : 1,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 10,
    });

    const skip = (pagination.page - 1) * pagination.limit;

    const where: any = {};
    if (searchParams.has("formType")) {
      where.formType = searchParams.get("formType");
    }
    if (searchParams.has("isActive")) {
      where.isActive = searchParams.get("isActive") === "true";
    }

    const [forms, total] = await Promise.all([
      prisma.form.findMany({
        where,
        include: {
          fields: {
            orderBy: { fieldOrder: "asc" },
          },
          _count: {
            select: { submissions: true },
          },
        },
        skip,
        take: pagination.limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.form.count({ where }),
    ]);

    // Transform forms to parse JSON strings and include PDF fields
    const transformedForms = forms.map(transformFormData);

    const response = Schemas.GetFormsResponse.parse({
      success: true,
      data: transformedForms,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        pages: Math.ceil(total / pagination.limit),
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/forms error:", error);

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
      { success: false, error: "Failed to fetch forms" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/forms
 * Create a new form with fields
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body
    const validatedData = Schemas.CreateForm.parse(body);

    const form = await prisma.form.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        formType: validatedData.formType,
        version: validatedData.version,
        isActive: true,
        pdfFileUrl: validatedData.pdfFileUrl || null,
        pdfFileName: validatedData.pdfFileName || null,
        fields: {
          create: validatedData.fields.map((field) => ({
            fieldName: field.fieldName,
            fieldLabel: field.fieldLabel,
            fieldType: field.fieldType,
            fieldOrder: field.fieldOrder,
            isRequired: field.isRequired,
            isHidden: field.isHidden,
            placeholder: field.placeholder,
            helpText: field.helpText,
            defaultValue: field.defaultValue,
            // Ensure options and validationRule are always strings in DB
            options: ensureString(field.options),
            validationRule: ensureString(field.validationRule),
            columnWidth: field.columnWidth,
          })),
        },
      },
      include: {
        fields: {
          orderBy: { fieldOrder: "asc" },
        },
      },
    });

    // Transform form to parse JSON strings and include PDF fields
    const transformedForm = transformFormData(form);

    const response = Schemas.CreateFormResponse.parse({
      success: true,
      data: transformedForm,
      message: "Form created successfully",
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("POST /api/forms error:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          message: error.issues.map((e) => `${e.path.join(".")}: ${e.message}`),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create form" },
      { status: 500 }
    );
  }
}