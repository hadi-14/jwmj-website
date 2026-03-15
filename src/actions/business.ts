'use server';

import { prisma } from "@/lib/prisma";
import { BusinessAds } from "@/types/businessAds";

export async function getBusinesses(limit?: number): Promise<BusinessAds[]> {
  try {
    // Get approved business ads that are currently active
    const currentDate = new Date();

    const approvedAds = await prisma.business_Ad_Request.findMany({
      where: {
        status: 'approved',
        approvals: {
          some: {
            approvedStartDate: {
              lte: currentDate
            },
            approvedEndDate: {
              gte: currentDate
            }
          }
        }
      },
      include: {
        member: {
          select: {
            MemName: true,
            MemMembershipNo: true
          }
        },
        approvals: {
          select: {
            approvedStartDate: true,
            approvedEndDate: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      },
      take: limit
    });

    // Transform to BusinessAds format
    const businesses: BusinessAds[] = approvedAds.map((ad) => ({
      id: ad.id,
      name: ad.businessName,
      logo: ad.logo || "/logo-placeholder.png", // Use uploaded logo or default
      category: ad.category,
      phone: ad.phone,
      email: ad.email,
      website: ad.website || "",
      address: ad.address,
      established: ad.established,
      owner: ad.owner,
      specialOffers: ad.specialOffers || "",
      services: JSON.parse(ad.services),
      description: ad.description,
      detailedDescription: ad.detailedDescription
    }));

    return businesses;
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return [];
  }
}

export async function submitBusinessAdRequest(data: {
  memberId: number;
  businessName: string;
  category: string;
  phone: string;
  email: string;
  website?: string;
  address: string;
  established: string;
  owner: string;
  specialOffers?: string;
  services: string[];
  description: string;
  detailedDescription: string;
  logo?: string;
  requestedStartDate: Date;
  requestedEndDate: Date;
}) {
  try {
    const request = await prisma.business_Ad_Request.create({
      data: {
        memberId: data.memberId,
        businessName: data.businessName,
        category: data.category,
        phone: data.phone,
        email: data.email,
        website: data.website,
        address: data.address,
        established: data.established,
        owner: data.owner,
        specialOffers: data.specialOffers,
        services: JSON.stringify(data.services),
        description: data.description,
        detailedDescription: data.detailedDescription,
        logo: data.logo,
        requestedStartDate: data.requestedStartDate,
        requestedEndDate: data.requestedEndDate,
        status: 'pending'
      }
    });

    return { success: true, requestId: request.id };
  } catch (error) {
    console.error('Error submitting business ad request:', error);
    return { success: false, error: 'Failed to submit request' };
  }
}

export async function getBusinessAdRequests(status?: string) {
  try {
    const requests = await prisma.business_Ad_Request.findMany({
      where: status ? { status } : {},
      include: {
        member: {
          select: {
            MemName: true,
            MemMembershipNo: true,
            MemFatherName: true
          }
        },
        approvals: true
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    // Transform to convert Decimal to number
    return requests.map(request => ({
      ...request,
      memberId: Number(request.memberId)
    }));
  } catch (error) {
    console.error('Error fetching business ad requests:', error);
    return [];
  }
}

export async function approveBusinessAdRequest(requestId: number, approvedBy: string, approvedStartDate: Date, approvedEndDate: Date, adminNotes?: string) {
  try {
    // Update request status
    await prisma.business_Ad_Request.update({
      where: { id: requestId },
      data: { status: 'approved' }
    });

    // Create approval record
    const approval = await prisma.business_Ad_Approval.create({
      data: {
        requestId,
        approvedBy,
        approvedStartDate,
        approvedEndDate,
        adminNotes
      }
    });

    return { success: true, approvalId: approval.id };
  } catch (error) {
    console.error('Error approving business ad request:', error);
    return { success: false, error: 'Failed to approve request' };
  }
}

export async function rejectBusinessAdRequest(requestId: number) {
  try {
    await prisma.business_Ad_Request.update({
      where: { id: requestId },
      data: {
        status: 'rejected'
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error rejecting business ad request:', error);
    return { success: false, error: 'Failed to reject request' };
  }
}

export async function getMemberBusinessAdRequests(memberId: number) {
  try {
    const requests = await prisma.business_Ad_Request.findMany({
      where: { memberId },
      include: {
        approvals: true
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    return requests;
  } catch (error) {
    console.error('Error fetching member business ad requests:', error);
    return [];
  }
}