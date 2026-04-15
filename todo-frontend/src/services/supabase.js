import { createClient } from '@supabase/supabase-js'

export function getSupabaseClient(accessToken) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY
  console.log(supabaseUrl, supabaseAnonKey)

  console.log('[Supabase Debug] Config Check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    bucket: process.env.VITE_SUPABASE_AVATAR_BUCKET || 'avatar'
  })

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Supabase] Missing environment variables.')
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

export const avatarBucket = process.env.VITE_SUPABASE_AVATAR_BUCKET || 'avatars'

export const supabase = getSupabaseClient(null)