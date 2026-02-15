import { prisma } from "@/lib/prisma";
import { Schemas } from "@/lib/schemas/form.schema";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * GET /api/submissions
 * Fetch all submissions with filters
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
        : 20,
    });

    const skip = (pagination.page - 1) * pagination.limit;

    const where: { isDeleted: boolean; formId?: string; status?: string } = {
      isDeleted: false,
    };

    if (searchParams.has("formId")) {
      where.formId = searchParams.get("formId");
    }

    if (searchParams.has("status")) {
      where.status = searchParams.get("status");
    }

    const [submissions, total] = await Promise.all([
      prisma.formSubmission.findMany({
        where,
        include: {
          form: {
            select: { name: true, formType: true },
          },
          fieldValues: {
            include: {
              field: {
                select: {
                  id: true,
                  fieldLabel: true,
                  fieldName: true,
                  fieldType: true,
                  fieldOrder: true,
                  isRequired: true,
                  isHidden: true,
                  placeholder: true,
                  helpText: true,
                  defaultValue: true,
                  validationRule: true,
                  options: true,
                  columnWidth: true,
                  formId: true,
                  createdAt: true,
                  updatedAt: true,
                },
              },
            },
          },
        },
        orderBy: { submissionDate: "desc" },
        skip,
        take: pagination.limit,
      }),
      prisma.formSubmission.count({ where }),
    ]);

    // Transform the data to handle JSON parsing and null fields
    const transformedSubmissions = submissions.map((submission: {
      fieldValues: Array<{ field: { validationRule: string | object | null; options: string | object | null } | null }>;
      [key: string]: unknown;
    }) => ({
      ...submission,
      fieldValues: submission.fieldValues
        .filter((fv: { field: unknown }) => fv.field !== null) // Filter out orphaned field values
        .map((fv: { field: { validationRule: string | object | null; options: string | object | null } | null;[key: string]: unknown }) => ({
          ...fv,
          field: fv.field ? {
            ...fv.field,
            validationRule: typeof fv.field.validationRule === 'string' && fv.field.validationRule
              ? (() => {
                try {
                  return JSON.parse(fv.field.validationRule);
                } catch {
                  return null;
                }
              })()
              : fv.field.validationRule,
            options: typeof fv.field.options === 'string' && fv.field.options
              ? (() => {
                try {
                  return JSON.parse(fv.field.options);
                } catch {
                  return [];
                }
              })()
              : fv.field.options,
          } : undefined
        }))
    }));

    // Return without Zod validation on the response to avoid schema mismatches
    return NextResponse.json({
      success: true,
      data: transformedSubmissions,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        pages: Math.ceil(total / pagination.limit),
      },
    });
  } catch (error) {
    console.error("GET /api/submissions error:", error);

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
      { success: false, error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/submissions
 * Create new submission
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body
    const validatedData = Schemas.CreateFormSubmission.parse(body);

    // Verify form exists
    const form = await prisma.form.findUnique({
      where: { id: validatedData.formId },
      include: { fields: true },
    });

    if (!form) {
      return NextResponse.json(
        { success: false, error: "Form not found" },
        { status: 404 }
      );
    }

    // Create submission
    const submission = await prisma.formSubmission.create({
      data: {
        formId: validatedData.formId,
        status: validatedData.status,
        memberComputerId: validatedData.memberComputerId
          ? Number(validatedData.memberComputerId)
          : null,
        submittedBy: validatedData.submittedBy || "anonymous",
        ipAddress: req.headers.get("x-forwarded-for") || "0.0.0.0",
        userAgent: req.headers.get("user-agent") || undefined,
        fieldValues: {
          create: form.fields.map((field) => ({
            fieldId: field.id,
            value: validatedData.fieldValues[field.fieldName]
              ? String(validatedData.fieldValues[field.fieldName])
              : null,
          })),
        },
      },
      include: {
        fieldValues: {
          include: {
            field: true,
          },
        },
      },
    });

    // Log audit
    await prisma.formAuditLog.create({
      data: {
        submissionId: submission.id,
        action:
          validatedData.status === "draft" ? "created_draft" : "submitted",
        changedBy: validatedData.submittedBy || "anonymous",
        ipAddress: req.headers.get("x-forwarded-for") || "0.0.0.0",
      },
    });

    // Return without strict Zod validation
    const response = {
      success: true,
      data: submission,
      message: "Submission created successfully",
    };
    return NextResponse.json(response, { status: 201 });
  } catch (error: unknown) {
    console.error('POST /api/submissions error:', error);

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
      { success: false, error: "Failed to create submission" },
      { status: 500 }
    );
  }
}