import { prisma } from "@/lib/prisma";
import { Schemas } from "@/lib/schemas/form.schema";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Helper function to transform form data from database format to API format
 * Parses JSON strings for options and validationRule back into objects
 */
function transformFormData(form: any) {
  return {
    ...form,
    fields: form.fields.map((field: any) => ({
      ...field,
      options: field.options ? JSON.parse(field.options) : null,
      validationRule: field.validationRule ? JSON.parse(field.validationRule) : null,
    })),
  };
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

    // Transform forms to parse JSON strings
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
          message: error.errors[0].message,
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
            options: field.options ? JSON.stringify(field.options) : null,
            validationRule: field.validationRule
              ? JSON.stringify(field.validationRule)
              : null,
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

    // Transform form to parse JSON strings
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