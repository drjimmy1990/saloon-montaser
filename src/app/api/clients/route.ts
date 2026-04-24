import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase';

// GET /api/clients
export async function GET(request: NextRequest) {
  try {
    const supabase = getServiceRoleClient();
    const { searchParams } = new URL(request.url);
    const ai_enabled = searchParams.get('ai_enabled');

    let query = supabase.from('Client').select('*, Message(*), Booking(id)').order('last_interaction_at', { ascending: false });
    
    if (ai_enabled !== null) {
      query = query.eq('ai_enabled', ai_enabled === 'true');
    }

    const { data: clients, error } = await query;

    if (error) throw error;

    // Map Message relation to messages array for frontend compatibility and calculate bookings_count
    const mapped = (clients || []).map((client: any) => ({
      ...client,
      messages: client.Message || [],
      bookings_count: client.Booking ? client.Booking.length : 0
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

// POST /api/clients
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = getServiceRoleClient();
    const { data: client, error } = await supabase
      .from('Client')
      .insert({
        name: body.name,
        phone: body.phone,
        address: body.address ?? '',
        notes: body.notes ?? '',
        platform_user_id: body.platform_user_id ?? body.phone,
        platform: body.platform ?? 'whatsapp',
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}
