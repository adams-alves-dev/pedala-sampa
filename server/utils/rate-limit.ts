/**
 * Rate limit simples por IP, em memória.
 *
 * Limitação conhecida: em ambiente serverless (Netlify Functions) cada
 * instância tem sua própria memória e instâncias são recicladas, então o
 * limite vale por instância — é uma barreira contra rajadas, não uma garantia
 * global. Evolução sugerida: Upstash Redis (estado compartilhado) e/ou
 * Cloudflare Turnstile (já suportado via TURNSTILE_ENABLED).
 */
const WINDOW_MS = 10 * 60 * 1000
const MAX_REQUESTS_PER_WINDOW = 5

const hits = new Map<string, { count: number; windowStart: number }>()

export function isRateLimited(ip: string, now = Date.now()): boolean {
  const entry = hits.get(ip)

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    hits.set(ip, { count: 1, windowStart: now })
    return false
  }

  entry.count += 1
  return entry.count > MAX_REQUESTS_PER_WINDOW
}

/** Evita crescimento sem limite da tabela em instâncias de vida longa. */
export function pruneRateLimit(now = Date.now()): void {
  for (const [ip, entry] of hits) {
    if (now - entry.windowStart > WINDOW_MS) {
      hits.delete(ip)
    }
  }
}
