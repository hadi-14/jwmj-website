import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, sanitizeInput, applyRateLimit, logSecurityEvent } from "@/lib/auth";

// Validate UUID format
function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// GET single event - public with rate limiting
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limit
    const rateLimitResponse = applyRateLimit(request, 60, 60000);
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid event ID format' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id },
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

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Failed to fetch event:', error);
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}

// PUT update event - admin only
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin authentication
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid event ID format' }, { status: 400 });
    }

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, desc, date, time, islamicDate, venue, category, img, fb } = body;

    // Build update data with validation
    const updateData: Record<string, unknown> = {};

    if (title) updateData.title = sanitizeInput(title);
    if (desc) updateData.desc = sanitizeInput(desc);
    if (date) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
      }
      updateData.date = parsedDate;
    }
    if (time !== undefined) updateData.time = time ? sanitizeInput(time) : null;
    if (islamicDate !== undefined) updateData.islamicDate = islamicDate ? sanitizeInput(islamicDate) : null;
    if (venue !== undefined) updateData.venue = venue ? sanitizeInput(venue) : null;
    if (category) {
      const validCategories = ['religious', 'social', 'educational', 'community', 'other'];
      if (!validCategories.includes(category.toLowerCase())) {
        return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
      }
      updateData.category = category.toLowerCase();
    }
    if (img) {
      const urlRegex = /^https?:\/\/.+/i;
      if (!urlRegex.test(img)) {
        return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 });
      }
      updateData.img = img;
    }
    if (fb !== undefined) {
      if (fb) {
        const urlRegex = /^https?:\/\/.+/i;
        if (!urlRegex.test(fb)) {
          return NextResponse.json({ error: 'Invalid Facebook URL' }, { status: 400 });
        }
      }
      updateData.fb = fb || null;
    }

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
    });

    await logSecurityEvent('EVENT_UPDATED', authResult.user.userId, { eventId: id }, request);

    return NextResponse.json(event);
  } catch (error) {
    console.error('Failed to update event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

// DELETE event - admin only
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin authentication
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid event ID format' }, { status: 400 });
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    await prisma.event.delete({
      where: { id },
    });

    await logSecurityEvent('EVENT_DELETED', authResult.user.userId, { eventId: id }, request);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
