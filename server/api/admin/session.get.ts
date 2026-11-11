export default defineEventHandler(async (event) => {
  const account = await currentAccount(event)
  return { signedIn: !!account, username: account?.username ?? null }
})
