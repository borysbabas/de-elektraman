export default defineEventHandler(async (event) => {
  return { signedIn: await isSignedIn(event) }
})
