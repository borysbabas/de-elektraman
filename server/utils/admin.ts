import { createHash, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

const SESSION_NAME = 'elektraman-admin'
const LOGIN_TABLE = 'elektraman_admin_login'
const CLIENT_ROW = ENV_KEY
const BACKUP_ROW = `${ENV_KEY}-backup`

// After 5 wrong passwords the client is locked out for 30 minutes. The developer's backup password still works
// during a lockout and lifts it; it has its own, stricter limit so it can't be guessed while the client is locked out.
const CLIENT_LIMIT = { attempts: 5, minutes: 30 }
const BACKUP_LIMIT = { attempts: 5, minutes: 24 * 60 }

type Attempt = { allowed: boolean; remaining: number; locked_until: string | null }

const adminSession = (event: H3Event) => {
  const { sessionPassword, adminPassword } = useRuntimeConfig(event)
  if (!adminPassword || !sessionPassword || sessionPassword.length < 32) {
    throw createError({ statusCode: 503, statusMessage: 'Admin is not configured' })
  }
  return useSession<{ admin?: boolean; generation?: number }>(event, {
    password: sessionPassword,
    name: SESSION_NAME,
    maxAge: 60 * 60 * 24 * 30,
    cookie: { httpOnly: true, sameSite: 'strict', secure: !import.meta.dev, path: '/' }
  })
}

const currentGeneration = async () => {
  const { data, error } = await supabase().from(LOGIN_TABLE).select('session_generation').eq('id', CLIENT_ROW).maybeSingle()
  if (error) throw error
  return (data?.session_generation as number | undefined) ?? 0
}

// Atomic in the database, so parallel guesses can't slip past the limit
const claimAttempt = async (row: string, limit: { attempts: number; minutes: number }) => {
  const { data, error } = await supabase().rpc('elektraman_claim_login_attempt', {
    p_id: row,
    p_max_attempts: limit.attempts,
    p_lock_minutes: limit.minutes
  })
  if (error) throw error
  return (data as Attempt[])[0]!
}

const matches = (input: string, secret: string) => {
  const hash = (value: string) => createHash('sha256').update(value).digest()
  return !!secret && timingSafeEqual(hash(input), hash(secret))
}

const locked = (until: string | null) => createError({
  statusCode: 423,
  statusMessage: 'Too many failed attempts',
  data: { lockedUntil: until }
})

export const isSignedIn = async (event: H3Event) => {
  const session = await adminSession(event)
  return session.data.admin === true && session.data.generation === await currentGeneration()
}

export const requireAdmin = async (event: H3Event) => {
  if (!await isSignedIn(event)) {
    throw createError({ statusCode: 401, statusMessage: 'Not signed in' })
  }
}

export const signIn = async (event: H3Event, password: unknown) => {
  const session = await adminSession(event)
  const { adminPassword, adminBackupPassword } = useRuntimeConfig(event)
  const input = typeof password === 'string' ? password : ''
  const isClient = matches(input, adminPassword)
  const isBackup = matches(input, adminBackupPassword)
  const fail = () => new Promise(resolve => setTimeout(resolve, 500))

  const attempt = await claimAttempt(CLIENT_ROW, CLIENT_LIMIT)
  if (!attempt.allowed) {
    const backup = adminBackupPassword ? await claimAttempt(BACKUP_ROW, BACKUP_LIMIT) : null
    if (!backup?.allowed || !isBackup) {
      await fail()
      throw locked(attempt.locked_until)
    }
  } else if (!isClient && !isBackup) {
    await fail()
    if (attempt.remaining === 0) throw locked(attempt.locked_until)
    throw createError({ statusCode: 401, statusMessage: 'Wrong password', data: { remaining: attempt.remaining } })
  }

  const { error } = await supabase().from(LOGIN_TABLE).update({ failed_attempts: 0, locked_until: null }).in('id', [CLIENT_ROW, BACKUP_ROW])
  if (error) throw error
  await session.update({ admin: true, generation: await currentGeneration() })
}

// Deletes the cookie and invalidates every session issued so far, so a copied cookie stops working too (signs out all devices)
export const signOut = async (event: H3Event) => {
  if (await isSignedIn(event)) {
    const { error } = await supabase().from(LOGIN_TABLE)
      .update({ session_generation: await currentGeneration() + 1 })
      .eq('id', CLIENT_ROW)
    if (error) throw error
  }
  deleteCookie(event, SESSION_NAME, { path: '/' })
}
