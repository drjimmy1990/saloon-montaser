import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getServiceRoleClient } from '@/lib/supabase';

// Helper to check if current user is admin
async function checkIsAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: role } = await getServiceRoleClient()
    .from('AppUserRole')
    .select('role')
    .eq('user_id', user.id)
    .single();

  return role?.role === 'admin';
}

export async function GET() {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const supabase = getServiceRoleClient();
    const { data: users, error } = await supabase
      .from('AppUserRole')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return NextResponse.json(users || []);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const body = await request.json();
    const { email, password, name, role, permissions } = body;

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabaseAdmin = getServiceRoleClient();
    
    // 1. Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // 2. Insert into AppUserRole
    const { data: userRole, error: dbError } = await supabaseAdmin
      .from('AppUserRole')
      .insert({
        user_id: userId,
        email,
        name,
        role,
        permissions: permissions || []
      })
      .select()
      .single();

    if (dbError) {
      // Rollback Auth creation if DB fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw dbError;
    }

    return NextResponse.json(userRole, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
