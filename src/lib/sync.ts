/**
 * Cloud sync — one JSON blob per user in `profiles_data`, gated by RLS.
 *
 * v1 policy: on login we PULL the remote row and let it win (last-write-wins per
 * device), then push a merged copy back so a row always exists. After that, any
 * local write schedules a debounced PUSH. Every call no-ops when Supabase isn't
 * configured or the user is signed out, so the app never breaks offline.
 */
import { supabase } from './supabase'
import { getSyncSnapshot, applySyncSnapshot, subscribeStorage } from './storage'

const TABLE = 'profiles_data'
const PUSH_DEBOUNCE_MS = 1500

let unsub: (() => void) | null = null
let timer: ReturnType<typeof setTimeout> | null = null

export async function pullRemote(userId: string): Promise<void> {
  if (!supabase) return
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('data')
      .eq('user_id', userId)
      .maybeSingle()
    if (!error && data?.data) applySyncSnapshot(data.data)
  } catch {
    /* offline / transient — keep local */
  }
}

async function pushRemote(userId: string): Promise<void> {
  if (!supabase) return
  try {
    await supabase
      .from(TABLE)
      .upsert(
        { user_id: userId, data: getSyncSnapshot(), updated_at: new Date().toISOString() },
        { onConflict: 'user_id' },
      )
  } catch {
    /* transient — the next write will retry */
  }
}

function schedulePush(userId: string): void {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => void pushRemote(userId), PUSH_DEBOUNCE_MS)
}

/** Start syncing for a signed-in user. Idempotent. */
export async function startSync(userId: string): Promise<void> {
  if (!supabase || unsub) return
  await pullRemote(userId)
  await pushRemote(userId)
  unsub = subscribeStorage(() => schedulePush(userId))
}

export function stopSync(): void {
  unsub?.()
  unsub = null
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

/** Delete the user's cloud row (used by "delete all my data"). */
export async function deleteRemote(userId: string): Promise<void> {
  if (!supabase) return
  try {
    await supabase.from(TABLE).delete().eq('user_id', userId)
  } catch {
    /* ignore */
  }
}
