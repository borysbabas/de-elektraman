export default defineEventHandler(async (event) => {
  const body = await readBody<{ username?: unknown; password?: unknown }>(event)
  const username = await signIn(event, body?.username, body?.password)
  return { signedIn: true, username }
})
