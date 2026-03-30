import { prisma } from "@/lib/prisma";
import { Schemas } from "@/lib/schemas/form.schema";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { Decimal } from "@prisma/client/runtime/client";

/**
 * Process and save family members from form submission data
 * Handles: spouse, children, and parents relationships
 */
async function processFamilyMembers(
  memberComputerId: Decimal,
  fieldValues: Record<string, unknown>
) {
  // Helper to safely parse numbers
  const getDecimal = (value: unknown): Decimal | null => {
    if (!value) return null;
    const num = Number(value);
    return isNaN(num) ? null : new Decimal(num);
  };

  // Helper to get string values
  const getString = (value: unknown): string | null => {
    return typeof value === 'string' && value ? value : null;
  };

  // Check for spouse data and save
  if (
    fieldValues.spouseName ||
    fieldValues.spouseMembershipNo ||
    fieldValues.spouseWehvariaNo
  ) {
    try {
      const spouseWehvariaNo = getDecimal(fieldValues.spouseWehvariaNo);
      if (spouseWehvariaNo) {
        await prisma.spouse_List.upsert({
          where: { Spu_MemberId: memberComputerId },
          create: {
            Spu_MemberId: memberComputerId,
            Spu_WehvariaNo: spouseWehvariaNo,
            Spu_StatusDate: new Date(),
            Spu_Details: getString(fieldValues.spouseDetails),
          },
          update: {
            Spu_WehvariaNo: spouseWehvariaNo,
            Spu_Details: getString(fieldValues.spouseDetails) || undefined,
          },
        });
      }
    } catch (error) {
      console.error('Error saving spouse:', error);
    }
  }

  // Check for children data and save
  if (fieldValues.childrenData && typeof fieldValues.childrenData === 'string') {
    try {
      const childrenArray = JSON.parse(fieldValues.childrenData);
      if (Array.isArray(childrenArray)) {
        for (const child of childrenArray) {
          const childWehvariaNo = getDecimal(child.wehvariaNo || child.Chd_WehvariaNo);
          if (childWehvariaNo) {
            await prisma.children_List.upsert({
              where: { Chd_WehvariaNo: childWehvariaNo },
              create: {
                Chd_WehvariaNo: childWehvariaNo,
                Chd_memberId: memberComputerId,
                Chd_MotherMemberID: memberComputerId,
                Chd_FatherMemberID: memberComputerId,
                Chd_StatusDate: new Date(),
                Chd_Details: getString(child.details),
              },
              update: {
                Chd_Details: getString(child.details) || undefined,
                Chd_StatusDate: new Date(),
              },
            });
          }
        }
      }
    } catch (error) {
      console.error('Error saving children:', error);
    }
  }

  // Additional child saving with individual field names
  if (fieldValues.childName || fieldValues.childWehvariaNo) {
    try {
      const childWehvariaNo = getDecimal(fieldValues.childWehvariaNo);
      if (childWehvariaNo) {
        await prisma.children_List.upsert({
          where: { Chd_WehvariaNo: childWehvariaNo },
          create: {
            Chd_WehvariaNo: childWehvariaNo,
            Chd_memberId: memberComputerId,
            Chd_MotherMemberID: memberComputerId,
            Chd_FatherMemberID: memberComputerId,
            Chd_StatusDate: new Date(),
            Chd_Details: getString(fieldValues.childName),
          },
          update: {
            Chd_Details: getString(fieldValues.childName) || undefined,
            Chd_StatusDate: new Date(),
          },
        });
      }
    } catch (error) {
      console.error('Error saving individual child:', error);
    }
  }

  // Check for parents data and save
  if (fieldValues.parentWehvariaNo || fieldValues.parentName) {
    try {
      const parentWehvariaNo = getDecimal(fieldValues.parentWehvariaNo);
      if (parentWehvariaNo) {
        await prisma.parents_List.upsert({
          where: { Par_MemberID: memberComputerId },
          create: {
            Par_MemberID: memberComputerId,
            Par_WehvariaNo: parentWehvariaNo,
            Par_StatusDate: new Date(),
            Par_Details: getString(fieldValues.parentName),
          },
          update: {
            Par_WehvariaNo: parentWehvariaNo,
            Par_Details: getString(fieldValues.parentName) || undefined,
            Par_StatusDate: new Date(),
          },
        });
      }
    } catch (error) {
      console.error('Error saving parent:', error);
    }
  }
}

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

    // Fetch member info for submissions that have memberComputerId
    const memberIds = submissions
      .filter((s: { memberComputerId: unknown }) => s.memberComputerId)
      .map((s: { memberComputerId: unknown }) => s.memberComputerId as Decimal);

    const members = memberIds.length > 0
      ? await prisma.member_Information.findMany({
        where: { MemComputerID: { in: memberIds } },
        select: {
          MemComputerID: true,
          MemName: true,
          MemMembershipNo: true,
          MemCNIC: true,
          Mem_Pic: true,
        },
      })
      : [];

    const memberMap = new Map(members.map(m => [m.MemComputerID.toString(), m]));

    // Transform the data to handle JSON parsing and null fields
    const transformedSubmissions = submissions.map((submission: {
      fieldValues: Array<{ field: { validationRule: string | object | null; options: string | object | null } | null }>;
      memberComputerId: Decimal | null;
      [key: string]: unknown;
    }) => {
      const memberData = submission.memberComputerId
        ? memberMap.get(submission.memberComputerId.toString())
        : null;

      return {
        ...submission,
        memberName: memberData?.MemName,
        memberMembershipNo: memberData?.MemMembershipNo,
        memberProfileImage: memberData?.Mem_Pic,
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
      };
    });

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

    // Convert memberComputerId to Decimal for database operations
    const memberComputerId = validatedData.memberComputerId
      ? new Decimal(Number(validatedData.memberComputerId))
      : null;

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

    // Process family members if memberComputerId is available
    if (memberComputerId) {
      try {
        await processFamilyMembers(memberComputerId, validatedData.fieldValues);
      } catch (familyError) {
        console.error('Error processing family members:', familyError);
        // Continue anyway - don't fail the submission if family member processing fails
      }
    }

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