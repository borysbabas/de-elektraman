import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Local dev uses its own rows and photo folder, so testing never touches the live portfolio or login state
export const ENV_KEY = import.meta.dev ? 'dev' : 'live'

let client: SupabaseClient | undefined

// Server-only client with the secret key: the tables have RLS on and no policies, so nothing else can touch them
export const supabase = () => {
  if (!client) {
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SECRET_KEY
    if (!url || !key) throw createError({ statusCode: 503, statusMessage: 'Supabase is not configured' })
    client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  }
  return client
}
