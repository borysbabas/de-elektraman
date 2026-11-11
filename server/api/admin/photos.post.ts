// Vercel caps request bodies at 4.5 MB; the admin page shrinks photos well below this before sending
const MAX_BYTES = 4 * 1024 * 1024

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readRawBody(event, false)
  if (!body?.length || body.length > MAX_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'Photo must be smaller than 4 MB' })
  }
  // JPEG files start with FF D8 FF; the admin page always converts to JPEG
  if (body[0] !== 0xFF || body[1] !== 0xD8 || body[2] !== 0xFF) {
    throw createError({ statusCode: 415, statusMessage: 'Photo must be a JPEG' })
  }
  return { url: await uploadPhoto(body) }
})
