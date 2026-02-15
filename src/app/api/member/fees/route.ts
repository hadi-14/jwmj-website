// app/api/member/fees/route.ts
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getMemberIdFromPayload, verifyMemberExists } from '@/lib/memberHelpers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function GET() {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token.value, JWT_SECRET);

    if (payload.role !== 'MEMBER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get member computer ID from payload (checks both memberData and email)
    const memberComputerId = await getMemberIdFromPayload(payload as { memberData?: { MemComputerID?: string | number }, email?: string });

    if (!memberComputerId) {
      return NextResponse.json({ error: 'Member data not found' }, { status: 404 });
    }

    // Verify member exists and is active
    const memberExists = await verifyMemberExists(memberComputerId);
    if (!memberExists) {
      return NextResponse.json({ error: 'Member not found or inactive' }, { status: 404 });
    }

    // Fetch annual fees
    const annualFees = await prisma.member_AnnualFee.findMany({
      where: { RFE_MemberID: memberComputerId },
      orderBy: { RFE_FiscalYear: 'desc' },
    });

    // Fetch fee receipts
    const feeReceipts = await prisma.annual_Fee_Receive_M.findMany({
      where: { ARM_MemberID: memberComputerId },
      orderBy: { ARM_Receive_Date: 'desc' },
    });

    // Fetch receipt details if needed
    const receiptDetails = await prisma.annual_Fee_Receive_D.findMany({
      where: {
        AFD_ARM_VoucherNo: {
          in: feeReceipts.map(r => r.ARM_VoucherNo),
        },
      },
    });

    // Calculate totals
    const totalDue = annualFees.reduce((sum, fee) =>
      sum + (fee.RFE_Fee ? Number(fee.RFE_Fee) : 0), 0
    );

    const totalPaid = feeReceipts.reduce((sum, receipt) =>
      sum + (receipt.ARM_Amount ? Number(receipt.ARM_Amount) : 0), 0
    );

    const totalDiscount = feeReceipts.reduce((sum, receipt) =>
      sum + (receipt.ARM_Disc ? Number(receipt.ARM_Disc) : 0), 0
    );

    const balance = totalDue - totalPaid - totalDiscount;

    // Get fiscal year breakdown
    const yearlyBreakdown = annualFees.map(fee => {
      const year = fee.RFE_FiscalYear?.toString() || 'Unknown';
      const feeAmount = Number(fee.RFE_Fee || 0);

      // Find payments for this invoice
      const relatedPayments = receiptDetails.filter(
        d => d.AFD_Invoice_No === fee.Rfe_Invoice_No.trim()
      );

      const paidAmount = relatedPayments.reduce(
        (sum, d) => sum + Number(d.AFD_Rec_Amount || 0), 0
      );

      const discountAmount = relatedPayments.reduce(
        (sum, d) => sum + Number(d.AFD_Disc_Amount || 0), 0
      );

      return {
        fiscalYear: year,
        invoiceNo: fee.Rfe_Invoice_No,
        invoiceDate: fee.RFE_Invoice_Date,
        feeAmount,
        paidAmount,
        discountAmount,
        balance: feeAmount - paidAmount - discountAmount,
        status: (feeAmount - paidAmount - discountAmount) <= 0 ? 'Paid' : 'Pending',
      };
    });

    // Format fee data
    const feeData = {
      summary: {
        totalDue,
        totalPaid,
        totalDiscount,
        balance,
        status: balance <= 0 ? 'Paid' : balance > 0 ? 'Pending' : 'Overpaid',
      },
      yearlyBreakdown: yearlyBreakdown.sort((a, b) =>
        (b.fiscalYear || '').localeCompare(a.fiscalYear || '')
      ),
      annualFees: annualFees.map(fee => ({
        invoiceNo: fee.Rfe_Invoice_No,
        invoiceDate: fee.RFE_Invoice_Date,
        fiscalYear: fee.RFE_FiscalYear?.toString(),
        amount: Number(fee.RFE_Fee || 0),
        details: fee.RFE_Details,
        voucherNo: fee.RFE_Acc_Voucher,
      })),
      payments: feeReceipts.map(receipt => {
        // Get details for this receipt
        const details = receiptDetails.filter(
          d => d.AFD_ARM_VoucherNo === receipt.ARM_VoucherNo
        );

        return {
          voucherNo: receipt.ARM_VoucherNo,
          receiveDate: receipt.ARM_Receive_Date,
          amount: Number(receipt.ARM_Amount || 0),
          discount: Number(receipt.ARM_Disc || 0),
          chequeNo: receipt.ARM_Cheq_No,
          chequeDate: receipt.ARM_Cheq_Date,
          bankHeadCode: receipt.ARM_Bank_HeadCode,
          feeHeadCode: receipt.ARM_Fee_HeadCode,
          details: details.map(d => ({
            invoiceNo: d.AFD_Invoice_No,
            receivedAmount: Number(d.AFD_Rec_Amount || 0),
            discountAmount: Number(d.AFD_Disc_Amount || 0),
          })),
        };
      }),
    };

    return NextResponse.json(feeData);
  } catch (error) {
    console.error('Fee status error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching fee status' },
      { status: 500 }
    );
  }
}