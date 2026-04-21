/**
 * lib/tokenSecurity.ts
 * ══════════════════════════════════════════════════════════════
 * Commit-Reveal Token Security for EcoReturn
 *
 * HOW IT WORKS:
 *   1. User scans bottles → clicks "Generate Token"
 *   2. Server generates a random plaintext code (e.g. ECO-7K3M9P)
 *   3. Server computes: codeHash = SHA-256(code + TOKEN_SECRET)
 *   4. DB stores ONLY codeHash + codePrefix (first 6 chars)
 *   5. Plaintext code is returned to user ONCE — never stored
 *   6. User writes it down / screenshots it
 *
 *   REDEMPTION:
 *   7. Shop owner receives the code from customer
 *   8. Shop owner types code into their panel
 *   9. Server recomputes: SHA-256(submitted_code + TOKEN_SECRET)
 *  10. If hash matches DB → valid token → redeem
 *  11. Admin can never see the code — only sees codePrefix + hash
 *
 * ENV REQUIRED:
 *   TOKEN_SECRET=<at least 32 random characters>
 *   Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 * ══════════════════════════════════════════════════════════════
 */

import crypto from 'crypto'

const TOKEN_SECRET = process.env.TOKEN_SECRET

if (!TOKEN_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('[EcoReturn] TOKEN_SECRET env variable is not set! Tokens cannot be secured.')
}

// Fallback for local dev only
const SECRET = TOKEN_SECRET || 'dev-secret-change-this-in-production-please'

// ── Character set: no ambiguous chars (0/O, 1/I/l) ──────────────────
const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

/**
 * Generate a cryptographically random token code.
 * Format: ECO-XXXXXXXX (8 random chars from CHARSET)
 * Example: ECO-7K3M9PQR
 */
export function generateTokenCode(): string {
  const bytes = crypto.randomBytes(8)
  let suffix = ''
  for (const byte of bytes) {
    suffix += CHARSET[byte % CHARSET.length]
  }
  return `ECO-${suffix}`
}

/**
 * Commit: hash the plaintext code with the server secret.
 * This is what gets stored in the database.
 */
export function hashTokenCode(plaintextCode: string): string {
  return crypto
    .createHmac('sha256', SECRET)
    .update(plaintextCode.trim().toUpperCase())
    .digest('hex')
}

/**
 * Reveal: verify a submitted code against the stored hash.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export function verifyTokenCode(submittedCode: string, storedHash: string): boolean {
  const computedHash = hashTokenCode(submittedCode)
  try {
    // timingSafeEqual requires same-length buffers
    return crypto.timingSafeEqual(
      Buffer.from(computedHash, 'hex'),
      Buffer.from(storedHash, 'hex')
    )
  } catch {
    return false
  }
}

/**
 * Extract a non-sensitive prefix for display/search in admin panel.
 * Returns first 6 chars: "ECO-7K" — enough to identify, not enough to guess.
 */
export function getCodePrefix(plaintextCode: string): string {
  return plaintextCode.slice(0, 6) // "ECO-7K"
}

/**
 * Redact a hash for safe logging/display.
 * Shows first 8 and last 4 chars only.
 * Example: "a3f9e1b2...c4d1"
 */
export function redactHash(hash: string): string {
  if (hash.length < 16) return '****'
  return `${hash.slice(0, 8)}...${hash.slice(-4)}`
}
