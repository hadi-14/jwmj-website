import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all events
export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        date: 'desc',
      },
    });
    return NextResponse.json(events);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// POST create event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, desc, date, category, img, fb } = body;

    if (!title || !desc || !date || !category || !img) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        title,
        desc,
        date: new Date(date),
        category,
        img,
        fb: fb || null,
      },
    });
    return NextResponse.json(event);
  }
  catch (error) {
    console.error('Failed to create event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}