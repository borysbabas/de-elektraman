import { createHash, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

// One shared admin password from the environment; the session lives in an encrypted cookie
const adminSession = (event: H3Event) => {
  const { sessionPassword, adminPassword } = useRuntimeConfig(event)
  if (!adminPassword || !sessionPassword || sessionPassword.length < 32) {
    throw createError({ statusCode: 503, statusMessage: 'Admin is not configured' })
  }
  return useSession<{ admin?: boolean }>(event, {
    password: sessionPassword,
    name: 'elektraman-admin',
    maxAge: 60 * 60 * 24 * 30,
    cookie: { httpOnly: true, sameSite: 'strict', secure: !import.meta.dev, path: '/' }
  })
}

export const isSignedIn = async (event: H3Event) => {
  const session = await adminSession(event)
  return session.data.admin === true
}

export const requireAdmin = async (event: H3Event) => {
  if (!await isSignedIn(event)) {
    throw createError({ statusCode: 401, statusMessage: 'Not signed in' })
  }
}

// shortcut: no attempt counter, so the password must be long and random; add rate limiting if it has to be memorable
export const signIn = async (event: H3Event, password: unknown) => {
  const session = await adminSession(event)
  const { adminPassword } = useRuntimeConfig(event)
  const hash = (value: string) => createHash('sha256').update(value).digest()
  if (typeof password !== 'string' || !timingSafeEqual(hash(password), hash(adminPassword))) {
    await new Promise(resolve => setTimeout(resolve, 500))
    throw createError({ statusCode: 401, statusMessage: 'Wrong password' })
  }
  await session.update({ admin: true })
}

export const signOut = async (event: H3Event) => {
  const session = await adminSession(event)
  await session.clear()
}
