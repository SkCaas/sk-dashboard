import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  {
    db: { schema: 'public' },
    auth: { persistSession: true }
  }
)
// rebuild Mon Apr 13 18:07:36 CST 2026
