export default defineEventHandler(async (event) => {
  const body = await readBody<{ password?: unknown }>(event)
  await signIn(event, body?.password)
  return { signedIn: true }
})
