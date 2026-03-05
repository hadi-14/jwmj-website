'use server';

import { prisma } from '@/lib/prisma';

export async function getDashboardStats() {
    try {
        const now = new Date();
        // Fetch 90 days of data to support different timeframe views
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        // Query all statistics in parallel for better performance
        const [
            totalMembers,
            newApplications,
            pendingSubmissions,
            approvedToday,
            recentSubmissions,
            membersTrendData,
            applicationsTrendData,
        ] = await Promise.all([
            // 1. Total Active Members from Member_Information
            prisma.member_Information.count({
                where: {
                    Mem_DeActive: { not: true }, // Count only active members
                },
            }),

            // 2. New Form Submissions in last 30 days
            prisma.formSubmission.count({
                where: {
                    submissionDate: {
                        gte: thirtyDaysAgo,
                    },
                    isDeleted: false,
                },
            }),

            // 3. Pending Review - count submissions with 'pending' status
            prisma.formSubmission.count({
                where: {
                    status: {
                        in: ['pending', 'submitted'],
                    },
                    isDeleted: false,
                },
            }),

            // 4. New Members registered today
            prisma.user.count({
                where: {
                    role: 'MEMBER',
                    createdAt: {
                        gte: startOfToday,
                    },
                },
            }),

            // 5. Recent Member Signups
            prisma.user.findMany({
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
                },
            }),

            // 6. Get members joined per day for last 90 days
            prisma.user.findMany({
                where: {
                    role: 'MEMBER',
                    createdAt: {
                        gte: ninetyDaysAgo,
                    },
                },
                select: {
                    createdAt: true,
                },
            }),

            // 7. Get applications/submissions per day for last 90 days
            prisma.formSubmission.findMany({
                where: {
                    submissionDate: {
                        gte: ninetyDaysAgo,
                    },
                    isDeleted: false,
                },
                select: {
                    submissionDate: true,
                },
            }),
        ]);

        // Format recent applications for the dashboard
        const formattedRecentApplications = recentSubmissions.map(submission => {
            const nameOrEmail = submission.name || submission.email || 'Anonymous';
            return {
                id: submission.id,
                applicant: nameOrEmail,
                type: 'Membership',
                date: submission.createdAt.toISOString().split('T')[0],
                status: 'Active',
                avatar: (nameOrEmail || '?').charAt(0).toUpperCase(),
            };
        });

        // Process trend data for charts
        const membersByDate: Record<string, number> = {};
        const applicationsByDate: Record<string, number> = {};

        // Group members by date
        membersTrendData.forEach(user => {
            const date = user.createdAt.toISOString().split('T')[0];
            membersByDate[date] = (membersByDate[date] || 0) + 1;
        });

        // Group applications by date
        applicationsTrendData.forEach(submission => {
            const date = submission.submissionDate.toISOString().split('T')[0];
            applicationsByDate[date] = (applicationsByDate[date] || 0) + 1;
        });

        // Create chart data arrays for last 90 days
        const chartData = [];
        for (let i = 89; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const displayDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            chartData.push({
                date: displayDate,
                fullDate: dateStr,
                members: membersByDate[dateStr] || 0,
                applications: applicationsByDate[dateStr] || 0,
            });
        }

        return {
            stats: {
                totalMembers,
                newApplications,
                pendingReview: pendingSubmissions,
                approvedToday,
            },
            recentApplications: formattedRecentApplications,
            chartData,
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
            chartData: [],
        };
    }
}

export async function getSystemStatus() {
    try {
        const startTime = Date.now();

        // Test database connection
        await prisma.$queryRaw`SELECT 1`;

        const dbResponseTime = Date.now() - startTime;

        // Get database connection info
        const dbHealth = dbResponseTime < 1000 ? 'Healthy' : dbResponseTime < 3000 ? 'Slow' : 'Unhealthy';

        // Calculate server load (simplified - in production you'd use actual system metrics)
        const serverLoad = Math.floor(Math.random() * 100); // Placeholder - replace with actual metrics

        // Get recent activity counts
        const now = new Date();
        const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

        const [recentUsers, recentSubmissions] = await Promise.all([
            prisma.user.count({
                where: {
                    createdAt: {
                        gte: lastHour,
                    },
                },
            }),
            prisma.formSubmission.count({
                where: {
                    submissionDate: {
                        gte: lastHour,
                    },
                    isDeleted: false,
                },
            }),
        ]);

        return {
            serverLoad: `${serverLoad}%`,
            serverLoadPercentage: serverLoad,
            database: dbHealth,
            dbResponseTime: `${dbResponseTime}ms`,
            recentActivity: recentUsers + recentSubmissions,
            uptime: '99.9%', // Placeholder - would need actual uptime tracking
        };
    } catch (error) {
        console.error('Error checking system status:', error);
        return {
            serverLoad: 'Unknown',
            serverLoadPercentage: 0,
            database: 'Error',
            dbResponseTime: 'N/A',
            recentActivity: 0,
            uptime: 'Unknown',
        };
    }
}
