import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase';

// GET /api/bookings
export async function GET() {
  try {
    const supabase = getServiceRoleClient();
    const { data: bookings, error } = await supabase
      .from('Booking')
      .select('*, client:Client(*)')
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return NextResponse.json(bookings || []);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

// POST /api/bookings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = getServiceRoleClient();
    const { data: booking, error } = await supabase
      .from('Booking')
      .insert({
        client_id: body.client_id,
        serviceSummary: body.serviceSummary,
        channelType: body.channelType,
        status: body.status ?? 'pending',
        ...(body.bookingDate && { bookingDate: new Date(body.bookingDate).toISOString() }),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
