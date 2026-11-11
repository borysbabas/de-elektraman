import { randomBytes } from 'node:crypto'
import type { H3Event } from 'h3'

const SESSION_NAME = 'elektraman-admin'
const ACCOUNTS = 'elektraman_admin_accounts'
// After 5 wrong passwords an account is locked for 30 minutes; other accounts keep working
const LIMIT = { attempts: 5, minutes: 30 }

type Account = { id: string; username: string; password_hash: string; session_generation: number }
type Attempt = { allowed: boolean; remaining: number; locked_until: string | null }

const adminSession = (event: H3Event) => {
  const { sessionPassword } = useRuntimeConfig(event)
  if (!sessionPassword || sessionPassword.length < 32) {
    throw createError({ statusCode: 503, statusMessage: 'Admin is not configured' })
  }
  return useSession<{ accountId?: string; generation?: number }>(event, {
    password: sessionPassword,
    name: SESSION_NAME,
    maxAge: 60 * 60 * 24 * 30,
    cookie: { httpOnly: true, sameSite: 'strict', secure: !import.meta.dev, path: '/' }
  })
}

const findAccount = async (match: { id: string } | { username: string }) => {
  const query = supabase().from(ACCOUNTS).select('id, username, password_hash, session_generation').eq('env', ENV_KEY)
  const { data, error } = await ('id' in match ? query.eq('id', match.id) : query.eq('username', match.username)).maybeSingle()
  if (error) throw error
  return data as Account | null
}

// A cookie from before the account's last sign-out or password change no longer counts
export const currentAccount = async (event: H3Event) => {
  const session = await adminSession(event)
  const { accountId, generation } = session.data
  if (!accountId) return null
  const account = await findAccount({ id: accountId })
  return account && account.session_generation === generation ? account : null
}

export const requireAdmin = async (event: H3Event) => {
  const account = await currentAccount(event)
  if (!account) throw createError({ statusCode: 401, statusMessage: 'Not signed in' })
  return account
}

// Atomic in the database, so parallel guesses can't slip past the limit
const claimAttempt = async (accountId: string) => {
  const { data, error } = await supabase().rpc('elektraman_claim_login_attempt', {
    p_account: accountId,
    p_max_attempts: LIMIT.attempts,
    p_lock_minutes: LIMIT.minutes
  })
  if (error) throw error
  return (data as Attempt[])[0]!
}

const failSlowly = () => new Promise(resolve => setTimeout(resolve, 500))
const wrongPassword = (remaining?: number) => createError({
  statusCode: 401,
  statusMessage: 'Wrong username or password',
  data: remaining === undefined ? undefined : { remaining }
})
const locked = (until: string | null) => createError({
  statusCode: 423,
  statusMessage: 'Too many failed attempts',
  data: { lockedUntil: until }
})

let dummyHash: Promise<string> | undefined

// Unknown usernames get the same answer and similar timing as a wrong password
const checkPassword = async (account: Account | null, password: string) => {
  if (!account) {
    dummyHash ??= hashPassword(randomBytes(16).toString('hex'))
    await verifyPassword(password, await dummyHash)
    await failSlowly()
    throw wrongPassword()
  }
  const attempt = await claimAttempt(account.id)
  if (!attempt.allowed) {
    await failSlowly()
    throw locked(attempt.locked_until)
  }
  if (!await verifyPassword(password, account.password_hash)) {
    await failSlowly()
    throw attempt.remaining === 0 ? locked(attempt.locked_until) : wrongPassword(attempt.remaining)
  }
  const { error } = await supabase().from(ACCOUNTS).update({ failed_attempts: 0, locked_until: null }).eq('id', account.id)
  if (error) throw error
}

const text = (value: unknown) => (typeof value === 'string' ? value : '')

export const signIn = async (event: H3Event, username: unknown, password: unknown) => {
  const session = await adminSession(event)
  const account = await findAccount({ username: text(username).trim().toLowerCase() })
  await checkPassword(account, text(password))
  await session.update({ accountId: account!.id, generation: account!.session_generation })
  return account!.username
}

// Deletes the cookie and ends this account's sessions on every device, so a copied cookie stops working too
export const signOut = async (event: H3Event) => {
  const account = await currentAccount(event)
  if (account) {
    const { error } = await supabase().from(ACCOUNTS)
      .update({ session_generation: account.session_generation + 1 })
      .eq('id', account.id)
    if (error) throw error
  }
  deleteCookie(event, SESSION_NAME, { path: '/' })
}

// The current password counts towards the lockout; other devices are signed out, this one stays signed in
export const changePassword = async (event: H3Event, current: unknown, next: unknown) => {
  const account = await requireAdmin(event)
  const password = text(next)
  if (password.length < MIN_PASSWORD_LENGTH || password.length > 200) {
    throw createError({ statusCode: 400, statusMessage: `Password must be ${MIN_PASSWORD_LENGTH}-200 characters` })
  }
  try {
    await checkPassword(account, text(current))
  } catch (error) {
    // 401 means "signed out" to the admin page; a wrong current password is a different situation
    const { statusCode, data } = error as { statusCode?: number; data?: unknown }
    throw statusCode === 401 ? createError({ statusCode: 403, statusMessage: 'Current password is wrong', data }) : error
  }
  const generation = account.session_generation + 1
  const { error } = await supabase().from(ACCOUNTS)
    .update({ password_hash: await hashPassword(password), session_generation: generation })
    .eq('id', account.id)
  if (error) throw error
  const session = await adminSession(event)
  await session.update({ accountId: account.id, generation })
}
