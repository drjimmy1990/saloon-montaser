const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase env variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
  const email = 'admin@saloon.com';
  const password = 'password123';
  const name = 'System Admin';

  console.log(`Creating admin user: ${email}...`);

  // 1. Create in Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    if (authError.message.includes('already exists')) {
      console.log('User already exists in Auth. Checking AppUserRole...');
      // We'll try to find them to ensure role is correct
      const { data: existingUser } = await supabase.auth.admin.listUsers();
      const user = existingUser.users.find(u => u.email === email);
      if (user) {
        await insertRole(user.id, email, name);
      }
      return;
    }
    console.error('Auth error:', authError);
    process.exit(1);
  }

  await insertRole(authData.user.id, email, name);
}

async function insertRole(userId, email, name) {
  const { error: dbError } = await supabase
    .from('AppUserRole')
    .upsert({
      user_id: userId,
      email,
      name,
      role: 'admin'
    }, { onConflict: 'email' });

  if (dbError) {
    console.error('DB error:', dbError);
    process.exit(1);
  }

  console.log('Admin user successfully configured!');
  console.log(`Email: ${email}`);
  console.log(`Password: password123`);
}

createAdmin();
