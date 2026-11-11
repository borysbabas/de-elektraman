export default defineEventHandler(async (event) => {
  await signOut(event)
  return { signedIn: false }
})
