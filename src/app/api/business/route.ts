import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const currentDate = new Date();

        // First, let's check if there are any business ads at all
        const totalAds = await prisma.business_Ad_Request.count();

        // Check approved ads count
        const approvedAdsCount = await prisma.business_Ad_Request.count({
            where: { status: 'approved' }
        });

        // Get approved business ads that are currently active
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
            }
        });

        // Transform to BusinessAds format
        const businesses = approvedAds.map((ad) => {
            try {
                const transformed = {
                    id: ad.id,
                    name: ad.businessName,
                    logo: ad.logo || '/logo-placeholder.png',
                    category: ad.category,
                    phone: ad.phone,
                    email: ad.email,
                    website: ad.website || '',
                    address: ad.address,
                    established: ad.established,
                    owner: ad.owner,
                    specialOffers: ad.specialOffers || '',
                    services: typeof ad.services === 'string' ? JSON.parse(ad.services) : ad.services,
                    description: ad.description,
                    detailedDescription: ad.detailedDescription
                };
                return transformed;
            } catch (transformError) {
                throw transformError;
            }
        });

        const response = {
            success: true,
            businesses,
            count: businesses.length,
            metadata: {
                totalAdsInDb: totalAds,
                approvedAdsCount,
                activeAdsCount: approvedAds.length,
                currentDate: currentDate.toISOString()
            }
        };

        return NextResponse.json(response);
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch businesses',
                metadata: {
                    error: error instanceof Error ? error.message : 'Unknown error'
                }
            },
            { status: 500 }
        );
    }
}
