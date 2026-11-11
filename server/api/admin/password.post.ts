export default defineEventHandler(async (event) => {
  const body = await readBody<{ current?: unknown; next?: unknown }>(event)
  await changePassword(event, body?.current, body?.next)
  return { changed: true }
})
