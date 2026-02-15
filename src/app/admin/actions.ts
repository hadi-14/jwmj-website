'use server';

import { prisma } from '@/lib/prisma';

export async function getDashboardStats() {
    try {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));

        // 1. Total Members (from Member_Information as it seems to be the main record)
        const totalMembers = await prisma.member_Information.count();

        // 2. New Applications (Users created in last 30 days - serving as a proxy for new signups)
        const newApplications = await prisma.user.count({
            where: {
                createdAt: {
                    gte: thirtyDaysAgo,
                },
                role: 'MEMBER', // Only count members
            },
        });

        // 3. Pending Review - Using Donation_Application as a proxy for "Applications"
        // OR just use a placeholder if no clear "Pending" status exists.
        // Looking at schema, Donation_Status has DST_Status. 
        // Let's just return 0 for now or count Users with some flag if we knew it.
        // For now, let's look at Member_Information where Mem_DeActive is true? No.
        // Let's just assume new users might need approval.
        const pendingReview = 0;

        // 4. Approved Today - maybe users created today?
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const approvedToday = await prisma.user.count({
            where: {
                createdAt: {
                    gte: startOfToday,
                },
                role: 'MEMBER',
            },
        });

        // 5. Recent Applications List
        // We'll fetch the most recent Users
        const recentUsers = await prisma.user.findMany({
            take: 5,
            orderBy: {
                createdAt: 'desc',
            },
            where: {
                role: 'MEMBER',
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                role: true,
            },
        });

        // Format recent applications for the dashboard
        const formattedRecentApplications = recentUsers.map(user => ({
            id: user.id,
            applicant: user.name || user.email || 'Unknown',
            type: 'Membership', // Hardcoded for now as we are fetching users
            date: user.createdAt.toISOString().split('T')[0],
            status: 'New', // Default status for new users
            avatar: (user.name || user.email || '?').charAt(0).toUpperCase(),
        }));

        return {
            stats: {
                totalMembers,
                newApplications,
                pendingReview,
                approvedToday,
            },
            recentApplications: formattedRecentApplications,
        };
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Return safe defaults on error
        return {
            stats: {
                totalMembers: 0,
                newApplications: 0,
                pendingReview: 0,
                approvedToday: 0,
            },
            recentApplications: [],
        };
    }
}
