import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from 'node:crypto'

// Plain Node module (no Nitro globals) so scripts/admin-account.ts can import it too

export const MIN_PASSWORD_LENGTH = 12

// scrypt with Node's default cost; stored as scrypt$N$r$p$salt$hash so the cost can be raised later
const COST = { N: 16384, r: 8, p: 1 }
const KEY_LENGTH = 64

const derive = (password: string, salt: Buffer, options: ScryptOptions) => new Promise<Buffer>((resolve, reject) => {
  scrypt(password, salt, KEY_LENGTH, options, (error, key) => (error ? reject(error) : resolve(key)))
})

export const hashPassword = async (password: string) => {
  const salt = randomBytes(16)
  const key = await derive(password, salt, COST)
  return ['scrypt', COST.N, COST.r, COST.p, salt.toString('base64'), key.toString('base64')].join('$')
}

export const verifyPassword = async (password: string, stored: string) => {
  const [scheme, N, r, p, salt, hash] = stored.split('$')
  if (scheme !== 'scrypt' || !salt || !hash) return false
  const expected = Buffer.from(hash, 'base64')
  const key = await derive(password, Buffer.from(salt, 'base64'), { N: Number(N), r: Number(r), p: Number(p) })
  return key.length === expected.length && timingSafeEqual(key, expected)
}
