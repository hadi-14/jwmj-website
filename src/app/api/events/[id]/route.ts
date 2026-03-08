import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

async function getEventId(request: NextRequest) {
  const path = new URL(request.url).pathname;
  const id = path.split('/').pop();
  return id;
}

// GET single event
export async function GET(request: NextRequest) {
  try {
    const id = await getEventId(request);
    const event = await prisma.event.findUnique({
      where: { id: id as string },
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

// PUT update event
export async function PUT(request: NextRequest) {
  try {
    const id = await getEventId(request);
    const body = await request.json();
    const { title, desc, date, time, islamicDate, venue, category, img, fb } = body;

    const event = await prisma.event.update({
      where: { id: id as string },
      data: {
        ...(title && { title }),
        ...(desc && { desc }),
        ...(date && { date: new Date(date) }),
        ...(time !== undefined && { time }),
        ...(islamicDate !== undefined && { islamicDate }),
        ...(venue !== undefined && { venue }),
        ...(category && { category }),
        ...(img && { img }),
        ...(fb !== undefined && { fb }),
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Failed to update event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

// DELETE event
export async function DELETE(request: NextRequest) {
  try {
    const id = await getEventId(request);
    await prisma.event.delete({
      where: { id: id as string },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
