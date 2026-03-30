import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Decimal } from "@prisma/client/runtime/client";

/**
 * Helper to convert Buffer/Bytes to base64 data URL
 * Handles both hex-encoded strings and raw buffers
 */
function bufferToBase64Image(buffer: Buffer | Uint8Array | null | undefined): string | null {
  if (!buffer || buffer.length === 0) return null;

  try {
    let realBuffer: Buffer;
    
    // Check if it's a hex-encoded string representation
    if (buffer instanceof Uint8Array && !(buffer instanceof Buffer)) {
      realBuffer = Buffer.from(buffer);
    } else {
      try {
        const hexString = buffer.toString('ascii');
        realBuffer = Buffer.from(hexString, 'hex');
      } catch {
        realBuffer = Buffer.from(buffer);
      }
    }

    // Detect MIME type from magic bytes
    let mimeType = 'image/jpeg';
    if (realBuffer[0] === 0x89 && realBuffer[1] === 0x50) mimeType = 'image/png';
    else if (realBuffer[0] === 0x47 && realBuffer[1] === 0x49) mimeType = 'image/gif';
    else if (realBuffer[0] === 0xFF && realBuffer[1] === 0xD8) mimeType = 'image/jpeg';
    else if (realBuffer[0] === 0x42 && realBuffer[1] === 0x4D) mimeType = 'image/bmp';

    return `data:${mimeType};base64,${realBuffer.toString('base64')}`;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return null;
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const memberId = new Decimal(id);

    const member = await prisma.member_Information.findUnique({
      where: { MemComputerID: memberId },
      select: {
        MemComputerID: true,
        MemName: true,
        MemMembershipNo: true,
        MemComputerDate: true,
        MemCNIC: true,
        MemDOB: true,
        MemPostalAddress: true,
        Mem_Pic: true,
        cellNumbers: {
          select: { MCL_CellNumber: true },
          take: 1,
        },
        emails: {
          select: { MEM_Emailid: true },
          take: 1,
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        { success: false, error: "Member not found" },
        { status: 404 }
      );
    }

    // Convert Mem_Pic to base64 if it exists - same logic as member portal
    const profileImage = bufferToBase64Image(member.Mem_Pic ? Buffer.from(member.Mem_Pic) : null);

    const transformedMember = {
      MemComputerID: member.MemComputerID,
      MemName: member.MemName,
      MemMembershipNo: member.MemMembershipNo,
      MemCNIC: member.MemCNIC,
      MemEmail: member.emails?.[0]?.MEM_Emailid || null,
      MemCell: member.cellNumbers?.[0]?.MCL_CellNumber.toString() || null,
      MemDOB: member.MemDOB,
      MemPostalAddress: member.MemPostalAddress,
      Mem_Pic: profileImage,
    };

    return NextResponse.json({
      success: true,
      data: transformedMember,
    });
  } catch (error) {
    console.error("Error fetching member:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch member" },
      { status: 500 }
    );
  }
}
