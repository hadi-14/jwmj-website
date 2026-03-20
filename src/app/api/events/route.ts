import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, sanitizeInput, applyRateLimit } from "@/lib/auth";

// GET all events - public endpoint but with rate limiting
export async function GET(request: NextRequest) {
  try {
    // Rate limit for public access
    const rateLimitResponse = applyRateLimit(request, 60, 60000);
    if (rateLimitResponse) return rateLimitResponse;

    const events = await prisma.event.findMany({
      orderBy: {
        date: 'desc',
      },
      select: {
        id: true,
        title: true,
        desc: true,
        date: true,
        time: true,
        islamicDate: true,
        venue: true,
        category: true,
        img: true,
        fb: true,
        createdAt: true,
      },
    });
    return NextResponse.json(events);
  } catch (error) {
    // Return empty array if database isn't configured
    const errorMessage = error instanceof Error ? error.message : '';
    if (errorMessage.includes('Database not configured')) {
      return NextResponse.json([]);
    }
    console.error('Failed to fetch events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// POST create event - admin only
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const { title, desc, date, time, islamicDate, venue, category, img, fb } = body;

    // Validate required fields
    if (!title || !desc || !date || !category || !img) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate date format
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    // Validate category
    const validCategories = ['religious', 'social', 'educational', 'community', 'other'];
    if (!validCategories.includes(category.toLowerCase())) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    // Validate URL format for img and fb
    const urlRegex = /^https?:\/\/.+/i;
    if (!urlRegex.test(img)) {
      return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 });
    }
    if (fb && !urlRegex.test(fb)) {
      return NextResponse.json({ error: 'Invalid Facebook URL' }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        title: sanitizeInput(title),
        desc: sanitizeInput(desc),
        date: parsedDate,
        time: time ? sanitizeInput(time) : null,
        islamicDate: islamicDate ? sanitizeInput(islamicDate) : null,
        venue: venue ? sanitizeInput(venue) : null,
        category: category.toLowerCase(),
        img,
        fb: fb || null,
      },
    });
    return NextResponse.json(event, { status: 201 });
  }
  catch (error) {
    console.error('Failed to create event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
