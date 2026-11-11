export default defineEventHandler(async () => {
  try {
    return (await readPortfolio()).portfolio
  } catch (error) {
    // If Supabase is unreachable or not configured the site keeps showing the built-in projects
    console.error('Reading portfolio failed', error)
    return defaultPortfolio
  }
})
