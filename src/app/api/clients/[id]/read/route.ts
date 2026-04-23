import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = getServiceRoleClient();
    
    // Update all unread messages from 'user' for this client
    const { error } = await supabase
      .from('Message')
      .update({ is_read_by_agent: true })
      .eq('client_id', id)
      .eq('sender_type', 'user')
      .eq('is_read_by_agent', false);

    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to mark messages as read' }, { status: 500 });
  }
}
