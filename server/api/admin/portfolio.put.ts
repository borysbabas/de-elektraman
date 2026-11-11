export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<{ portfolio?: unknown; etag?: unknown }>(event)
  const portfolio = parsePortfolio(body?.portfolio)
  const etag = typeof body?.etag === 'string' ? body.etag : null

  const current = await readPortfolio()
  if (current.etag !== etag) {
    throw createError({ statusCode: 409, statusMessage: 'Portfolio changed since it was loaded' })
  }

  const newEtag = await writePortfolio(portfolio, etag)
  try {
    await deleteUnusedPhotos(current.portfolio, portfolio)
  } catch (error) {
    // The save already succeeded; a leftover photo only costs storage
    console.error('Deleting removed photos failed', error)
  }
  return { etag: newEtag }
})
