import { prisma } from "@/lib/prisma";
import { Schemas } from "@/lib/schemas/form.schema";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireAdmin, applyRateLimit, sanitizeInput } from "@/lib/auth";

/**
 * Helper function to transform form data from database format to API format
 */
interface FormWithFields {
  pdfFileName: string | null;
  pdfFileUrl: string | null;
  fields: Array<{
    options: string | null;
    validationRule: string | null;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

function transformFormData(form: FormWithFields) {
  return {
    ...form,
    pdfFileName: form.pdfFileName,
    pdfFileUrl: form.pdfFileUrl,
    fields: form.fields.map((field) => ({
      ...field,
      options: field.options ? JSON.parse(field.options) : null,
      validationRule: field.validationRule ? JSON.parse(field.validationRule) : null,
    })),
  };
}

/**
 * Helper to ensure a value is stringified if it's not already a string
 */
function ensureString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

/**
 * GET /api/forms
 * Public endpoint with rate limiting
 */
export async function GET(req: NextRequest) {
  try {
    // Rate limit
    const rateLimitResponse = applyRateLimit(req, 60, 60000);
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = new URL(req.url);

    // Validate pagination with limits
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const skip = (page - 1) * limit;

    const where: { formType?: string; isActive?: boolean } = {};
    if (searchParams.has("formType")) {
      const formType = searchParams.get("formType");
      // Validate formType to prevent injection
      if (formType && /^[a-zA-Z0-9_-]+$/.test(formType)) {
        where.formType = formType;
      }
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
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.form.count({ where }),
    ]);

    const transformedForms = forms.map(transformFormData);

    const response = Schemas.GetFormsResponse.parse({
      success: true,
      data: transformedForms,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
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
 * Admin only - Create a new form
 */
export async function POST(req: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await req.json();

    // Validate request body
    const validatedData = Schemas.CreateForm.parse(body);

    // Sanitize text fields
    const sanitizedName = sanitizeInput(validatedData.name);
    const sanitizedDescription = validatedData.description 
      ? sanitizeInput(validatedData.description) 
      : null;

    const form = await prisma.form.create({
      data: {
        name: sanitizedName,
        description: sanitizedDescription,
        formType: validatedData.formType,
        version: validatedData.version,
        isActive: true,
        pdfFileUrl: validatedData.pdfFileUrl || null,
        pdfFileName: validatedData.pdfFileName || null,
        fields: {
          create: validatedData.fields.map((field) => ({
            fieldName: sanitizeInput(field.fieldName),
            fieldLabel: sanitizeInput(field.fieldLabel),
            fieldType: field.fieldType,
            fieldOrder: field.fieldOrder,
            isRequired: field.isRequired,
            isHidden: field.isHidden,
            placeholder: field.placeholder ? sanitizeInput(field.placeholder) : null,
            helpText: field.helpText ? sanitizeInput(field.helpText) : null,
            defaultValue: field.defaultValue ? sanitizeInput(field.defaultValue) : null,
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
