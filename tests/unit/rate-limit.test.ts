import { describe, expect, it } from 'vitest'
import { isRateLimited, pruneRateLimit } from '../../server/utils/rate-limit'

const WINDOW_MS = 10 * 60 * 1000
const NOW = 1_700_000_000_000

// o módulo guarda estado em memória — cada teste usa um IP próprio para não vazar estado
describe('isRateLimited', () => {
  it('permite as 5 primeiras requisições da janela', () => {
    for (let i = 0; i < 5; i++) {
      expect(isRateLimited('ip-allow', NOW + i)).toBe(false)
    }
  })

  it('bloqueia a partir da 6ª requisição na mesma janela', () => {
    for (let i = 0; i < 5; i++) {
      isRateLimited('ip-block', NOW + i)
    }
    expect(isRateLimited('ip-block', NOW + 5)).toBe(true)
    expect(isRateLimited('ip-block', NOW + 6)).toBe(true)
  })

  it('reseta o contador quando a janela expira', () => {
    for (let i = 0; i < 6; i++) {
      isRateLimited('ip-reset', NOW + i)
    }
    expect(isRateLimited('ip-reset', NOW + WINDOW_MS + 1)).toBe(false)
  })

  it('conta cada IP de forma independente', () => {
    for (let i = 0; i < 6; i++) {
      isRateLimited('ip-noisy', NOW + i)
    }
    expect(isRateLimited('ip-quiet', NOW)).toBe(false)
  })
})

describe('pruneRateLimit', () => {
  it('preserva entradas dentro da janela', () => {
    for (let i = 0; i < 5; i++) {
      isRateLimited('ip-prune-keep', NOW + i)
    }
    pruneRateLimit(NOW + 10)
    expect(isRateLimited('ip-prune-keep', NOW + 11)).toBe(true)
  })

  it('descarta entradas expiradas — rajada nova volta a ser permitida', () => {
    for (let i = 0; i < 6; i++) {
      isRateLimited('ip-prune-drop', NOW + i)
    }
    pruneRateLimit(NOW + WINDOW_MS + 1)
    for (let i = 0; i < 5; i++) {
      expect(isRateLimited('ip-prune-drop', NOW + WINDOW_MS + 2 + i)).toBe(
        false,
      )
    }
  })
})
