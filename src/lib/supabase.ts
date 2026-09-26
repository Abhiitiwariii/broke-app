/**
 * Supabase client — null-guarded.
 *
 * The client is created ONLY when both env vars are present, otherwise every
 * export is a safe no-op / null and the app runs fully offline with the
 * dev-skip on the login screen. Keys live in `.env.local` (+ Vercel), never in
 * the repo. The anon key is safe to ship to the browser — row-level security
 * on the `profiles_data` table is what actually protects user rows.
 */
import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null

/** True when real Supabase keys are configured (prod / a keyed dev env). */
export const isSupabaseConfigured = supabase != null

export type { Session }

/** Full-page OAuth redirect to Google, back to the current origin. */
export async function signInWithGoogle(): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  })
  if (error) throw error
}

/** Send a 6-digit SMS OTP. `phone` must be E.164, e.g. +919876543210. */
export async function sendPhoneOtp(phone: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase.auth.signInWithOtp({ phone })
  if (error) throw error
}

/** Verify the SMS OTP; on success Supabase emits a session via onAuthStateChange. */
export async function verifyPhoneOtp(phone: string, token: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' })
  if (error) throw error
}

export async function signOut(): Promise<void> {
  if (!supabase) return
  await supabase.auth.signOut()
}
