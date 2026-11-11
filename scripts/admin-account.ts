// Creates a /admin account, or resets its password and lifts a lockout. Prints the new password once.
// Usage: npm run admin:account -- <username> [--env dev]   (needs Node 23.6+ and .env.local from `vercel env pull`)
import { randomBytes } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { hashPassword } from '../server/utils/password.ts'

const args = process.argv.slice(2)
const envFlag = args.indexOf('--env')
const env = envFlag >= 0 ? args[envFlag + 1] : 'live'
const username = args.find((arg, i) => !arg.startsWith('--') && (envFlag < 0 || i !== envFlag + 1))?.trim().toLowerCase()

if (!username || !/^[a-z0-9._-]{2,40}$/.test(username) || (env !== 'live' && env !== 'dev')) {
  console.error('Usage: npm run admin:account -- <username> [--env dev]\nUsernames are 2-40 characters: a-z, 0-9, . _ -')
  process.exit(1)
}

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SECRET_KEY
if (!url || !key) {
  console.error('SUPABASE_URL and SUPABASE_SECRET_KEY are missing. Run: vercel env pull .env.local --yes')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })
const table = supabase.from('elektraman_admin_accounts')

// 24 random characters; meant to be saved in a password manager, the client can change it in /admin afterwards
const password = randomBytes(18).toString('base64url')
const reset = { password_hash: await hashPassword(password), failed_attempts: 0, locked_until: null }

const { data: existing, error: readError } = await supabase.from('elektraman_admin_accounts')
  .select('id, session_generation').eq('env', env).eq('username', username).maybeSingle()
if (readError) throw readError

// A reset also signs the account out everywhere
const { error } = existing
  ? await table.update({ ...reset, session_generation: existing.session_generation + 1 }).eq('id', existing.id)
  : await table.insert({ env, username, ...reset })
if (error) throw error

console.log(`${existing ? 'Reset' : 'Created'} ${env} account "${username}". Password (shown once):\n\n  ${password}\n`)
