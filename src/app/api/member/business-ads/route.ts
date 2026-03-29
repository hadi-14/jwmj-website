import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Validation constants
const BUSINESS_CATEGORIES = [
    'Textile & Fashion', 'Electronics', 'Food & Dining', 'Automotive',
    'Grocery & Food', 'Construction', 'Education', 'Events & Venues',
    'Technology Services', 'Healthcare', 'Real Estate', 'Other'
];

const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Helper: Validate base64 image
function validateBase64Image(base64String: string | undefined): { valid: boolean; error?: string; imageData?: string } {
    if (!base64String) {
        return { valid: true }; // Logo is optional
    }

    // Accept non-base64 paths (URLs) created by upload endpoint
    if (typeof base64String === 'string' && (base64String.startsWith('/') || base64String.startsWith('http://') || base64String.startsWith('https://'))) {
        return { valid: true, imageData: base64String };
    }

    try {
        const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches) {
            return { valid: false, error: 'Invalid base64 image format' };
        }

        const mimeType = matches[1];
        const base64Data = matches[2];

        if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
            return { valid: false, error: 'Invalid image type. Allowed: JPEG, PNG, GIF, WebP' };
        }

        const estimatedSize = (base64Data.length * 3) / 4;
        if (estimatedSize > MAX_LOGO_SIZE) {
            return { valid: false, error: 'Image size exceeds 2MB limit' };
        }

        return { valid: true, imageData: base64String };
    } catch {
        return { valid: false, error: 'Failed to validate image' };
    }
}

// Helper: Validate form data
function validateFormData(data: unknown): { valid: boolean; errors: string[] } {
    const castData = data as Record<string, unknown>;

    const errors: string[] = [];

    if (!castData.businessName || typeof castData.businessName !== 'string' || !castData.businessName.trim()) errors.push('Business name is required');
    if (!castData.category || typeof castData.category !== 'string' || !castData.category.trim()) errors.push('Category is required');
    if (!castData.phone || typeof castData.phone !== 'string' || !castData.phone.trim()) errors.push('Phone is required');
    if (!castData.email || typeof castData.email !== 'string' || !castData.email.trim()) errors.push('Email is required');
    if (!castData.address || typeof castData.address !== 'string' || !castData.address.trim()) errors.push('Address is required');
    if (!castData.owner || typeof castData.owner !== 'string' || !castData.owner.trim()) errors.push('Owner name is required');
    if (!castData.description || typeof castData.description !== 'string' || !castData.description.trim()) errors.push('Description is required');
    if (!castData.requestedStartDate || typeof castData.requestedStartDate !== 'string') errors.push('Start date is required');
    if (!castData.requestedEndDate || typeof castData.requestedEndDate !== 'string') errors.push('End date is required');

    if (castData.category && typeof castData.category === 'string' && !BUSINESS_CATEGORIES.includes(castData.category)) {
        errors.push('Invalid category selected');
    }

    if (castData.email && typeof castData.email === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(castData.email)) {
        errors.push('Invalid email format');
    }

    if (castData.phone && typeof castData.phone === 'string' && !/^[\d\s\-\+\(\)]{7,}$/.test(castData.phone)) {
        errors.push('Invalid phone number format');
    }

    if (castData.requestedStartDate && castData.requestedEndDate && typeof castData.requestedStartDate === 'string' && typeof castData.requestedEndDate === 'string') {
        const startDate = new Date(castData.requestedStartDate);
        const endDate = new Date(castData.requestedEndDate);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            errors.push('Invalid date format');
        } else if (endDate <= startDate) {
            errors.push('End date must be after start date');
        } else if (startDate < new Date()) {
            errors.push('Start date cannot be in the past');
        }
    }

    if (Array.isArray(castData.services)) {
        const filteredServices = (castData.services as unknown[]).filter((s: unknown) => typeof s === 'string' && s.trim());
        if (filteredServices.length === 0) {
            errors.push('At least one service is required');
        }
    } else {
        errors.push('Services must be an array');
    }

    if (castData.businessName && typeof castData.businessName === 'string' && castData.businessName.length > 100) errors.push('Business name must be less than 100 characters');
    if (castData.description && typeof castData.description === 'string' && castData.description.length > 500) errors.push('Description must be less than 500 characters');
    if (castData.detailedDescription && typeof castData.detailedDescription === 'string' && castData.detailedDescription.length > 2000) errors.push('Detailed description must be less than 2000 characters');

    return { valid: errors.length === 0, errors };
}

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as {
            userId: string;
            email: string;
            role: string;
        };

        // Get member info from database using the user ID
        const member = await prisma.member_Emailid.findFirst({
            where: { MEM_Emailid: decoded.email },
            select: {
                MEM_MemComputerID: true,
            }
        });

        if (!member) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 });
        }

        // Get business ad requests for this member
        const requests = await prisma.business_Ad_Request.findMany({
            where: { memberId: member.MEM_MemComputerID },
            include: {
                approvals: true
            },
            orderBy: {
                submittedAt: 'desc'
            }
        });

        return NextResponse.json(requests);
    } catch (error) {
        console.error('Error fetching member business ads:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET) as {
                userId: string;
                email: string;
                role: string;
            };
        } catch {
            return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
        }

        const member = await prisma.member_Emailid.findFirst({
            where: { MEM_Emailid: decoded.email },
            select: { MEM_MemComputerID: true }
        });

        if (!member) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 });
        }

        const body = await request.json();

        const validation = validateFormData(body);
        if (!validation.valid) {
            return NextResponse.json(
                { error: 'Validation failed', details: validation.errors },
                { status: 400 }
            );
        }

        const logoValidation = validateBase64Image(body.logo);
        if (!logoValidation.valid) {
            return NextResponse.json(
                { error: logoValidation.error || 'Invalid image' },
                { status: 400 }
            );
        }

        const services = Array.isArray(body.services)
            ? body.services.filter((s: string) => typeof s === 'string' && s.trim())
            : [];

        const businessAdRequest = await prisma.business_Ad_Request.create({
            data: {
                memberId: member.MEM_MemComputerID,
                businessName: body.businessName.trim(),
                category: body.category.trim(),
                phone: body.phone.trim(),
                email: body.email.trim(),
                website: body.website?.trim() || null,
                address: body.address.trim(),
                established: body.established?.trim() || '',
                owner: body.owner.trim(),
                specialOffers: body.specialOffers?.trim() || null,
                services: JSON.stringify(services),
                description: body.description.trim(),
                detailedDescription: body.detailedDescription?.trim() || '',
                logo: logoValidation.imageData || null,
                requestedStartDate: new Date(body.requestedStartDate),
                requestedEndDate: new Date(body.requestedEndDate),
                status: 'pending'
            }
        });

        return NextResponse.json(
            {
                success: true,
                requestId: businessAdRequest.id,
                message: 'Business ad request submitted successfully for approval'
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating business ad request:', error);

        if (error instanceof SyntaxError) {
            return NextResponse.json(
                { error: 'Invalid JSON in request body' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
