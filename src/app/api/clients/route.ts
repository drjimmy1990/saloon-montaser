import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase';

// GET /api/clients
export async function GET(request: NextRequest) {
  try {
    const supabase = getServiceRoleClient();
    const { searchParams } = new URL(request.url);
    const ai_enabled = searchParams.get('ai_enabled');

    let query = supabase.from('Client').select('*, Channel(name, type), Message(*), Booking(id)').order('last_interaction_at', { ascending: false });
    
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
    
    const phone = body.phone || '';
    const platform_user_id = body.platform_user_id || phone;

    // Check if client already exists by phone or platform_user_id
    if (phone || platform_user_id) {
      const { data: existingClients, error: searchError } = await supabase
        .from('Client')
        .select('id')
        .or(`phone.eq.${phone},platform_user_id.eq.${platform_user_id}`)
        .limit(1);

      if (!searchError && existingClients && existingClients.length > 0) {
        // Update existing client
        const existingId = existingClients[0].id;
        const updateData: any = {};
        if (body.ai_enabled !== undefined) updateData.ai_enabled = body.ai_enabled;
        
        const { data: updatedClient, error: updateError } = await supabase
          .from('Client')
          .update(updateData)
          .eq('id', existingId)
          .select()
          .single();
          
        if (updateError) throw updateError;
        return NextResponse.json(updatedClient, { status: 200 });
      }
    }

    // Insert new client
    const insertData: any = {
      name: body.name || null,
      phone: phone,
      address: body.address ?? '',
      notes: body.notes ?? '',
      platform_user_id: platform_user_id,
      platform: body.platform ?? 'whatsapp',
    };

    if (body.ai_enabled !== undefined) {
      insertData.ai_enabled = body.ai_enabled;
    }

    const { data: client, error: insertError } = await supabase
      .from('Client')
      .insert(insertData)
      .select()
      .single();

    if (insertError) throw insertError;
    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create or update client' }, { status: 500 });
  }
}
