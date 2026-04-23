import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = getServiceRoleClient();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.role !== undefined) updateData.role = body.role;
    if (body.permissions !== undefined) updateData.permissions = body.permissions;

    // Fetch the AppUserRole to get the user_id if we need to update password
    if (body.password) {
      const { data: currentUserRole, error: fetchError } = await supabase
        .from('AppUserRole')
        .select('user_id')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      const { error: authError } = await supabase.auth.admin.updateUserById(
        currentUserRole.user_id,
        { password: body.password }
      );
      if (authError) throw authError;
    }

    const { data: user, error } = await supabase
      .from('AppUserRole')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = getServiceRoleClient();
    const { error } = await supabase.from('AppUserRole').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
