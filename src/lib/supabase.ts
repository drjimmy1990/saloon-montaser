import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// This client is safe to use in browser (client-side) components or server components with standard RLS
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Optional: Admin client for server-side operations that bypass RLS
// DO NOT expose this to the browser!
export const getServiceRoleClient = () => {
  return createClient(
    supabaseUrl, 
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
