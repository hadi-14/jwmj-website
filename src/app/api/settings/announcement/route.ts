import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, sanitizeInput, logSecurityEvent } from '@/lib/auth';

const ANNOUNCEMENT_KEY = 'header_announcement';
const DEFAULT_ANNOUNCEMENT = JSON.stringify({
  messages: [
    "Welcome to JWMJ! • Upcoming Eid Milan Party!",
  ],
  enabled: true
});

// GET - Public endpoint to fetch announcement
export async function GET() {
  try {
    // Check if prisma is available
    if (!prisma || typeof prisma.siteSettings === 'undefined') {
      // Return default announcement if database not configured
      return NextResponse.json(JSON.parse(DEFAULT_ANNOUNCEMENT));
    }

    const setting = await prisma.siteSettings.findUnique({
      where: { key: ANNOUNCEMENT_KEY }
    });

    if (!setting) {
      return NextResponse.json(JSON.parse(DEFAULT_ANNOUNCEMENT));
    }

    return NextResponse.json(JSON.parse(setting.value));
  } catch (error) {
    console.error('Failed to fetch announcement:', error);
    // Return default on error
    return NextResponse.json(JSON.parse(DEFAULT_ANNOUNCEMENT));
  }
}

// PUT - Admin only endpoint to update announcement
export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication using requireAdmin
    const authResult = await requireAdmin();
    
    // If it's a NextResponse, it means auth failed - return it
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    const body = await request.json();
    const { messages, enabled } = body;

    // Validate input
    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages must be an array' }, { status: 400 });
    }

    if (messages.length === 0) {
      return NextResponse.json({ error: 'At least one message is required' }, { status: 400 });
    }

    if (messages.length > 5) {
      return NextResponse.json({ error: 'Maximum 5 messages allowed' }, { status: 400 });
    }

    // Sanitize messages
    const sanitizedMessages = messages.map((msg: string) => 
      sanitizeInput(String(msg).slice(0, 200))
    );

    const value = JSON.stringify({
      messages: sanitizedMessages,
      enabled: Boolean(enabled)
    });

    // Check if prisma is available
    if (!prisma || typeof prisma.siteSettings === 'undefined') {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    // Upsert the setting
    const setting = await prisma.siteSettings.upsert({
      where: { key: ANNOUNCEMENT_KEY },
      update: {
        value,
        updatedBy: user.userId
      },
      create: {
        key: ANNOUNCEMENT_KEY,
        value,
        updatedBy: user.userId
      }
    });

    await logSecurityEvent('SETTING_UPDATED', user.userId, { key: ANNOUNCEMENT_KEY }, request);

    return NextResponse.json({
      success: true,
      data: JSON.parse(setting.value)
    });
  } catch (error) {
    console.error('Failed to update announcement:', error);
    return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 });
  }
}
