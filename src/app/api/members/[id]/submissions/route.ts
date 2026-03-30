import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Decimal } from "@prisma/client/runtime/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const memberId = new Decimal(id);

    const submissions = await prisma.formSubmission.findMany({
      where: {
        memberComputerId: memberId,
        isDeleted: false,
      },
      include: {
        form: {
          select: { name: true, formType: true },
        },
      },
      orderBy: { submissionDate: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    console.error("Error fetching member submissions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
