import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

export const avatarBucket = process.env.VITE_SUPABASE_AVATAR_BUCKET || 'avatars'

export function getSupabaseClient(accessToken) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  const options = accessToken
    ? {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      }
    : undefined

  return createClient(supabaseUrl, supabaseAnonKey, options)
}

export const supabase = getSupabaseClient(null)
