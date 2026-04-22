import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/bookings
export async function GET() {
  try {
    const bookings = await db.booking.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

// POST /api/bookings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const booking = await db.booking.create({
      data: {
        clientName: body.clientName,
        clientPhone: body.clientPhone ?? '',
        clientAddress: body.clientAddress ?? '',
        serviceSummary: body.serviceSummary,
        channelType: body.channelType,
        status: body.status ?? 'pending',
        ...(body.bookingDate && { bookingDate: new Date(body.bookingDate) }),
      },
    });
    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
