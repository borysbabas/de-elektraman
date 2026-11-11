// Also called with navigator.sendBeacon when the admin page closes with unsaved uploads
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<{ urls?: unknown }>(event)
  const urls = Array.isArray(body?.urls) ? body.urls.filter((url): url is string => typeof url === 'string').slice(0, 100) : []
  await discardPhotos(urls)
  return { discarded: true }
})
