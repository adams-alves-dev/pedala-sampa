import { describe, expect, it } from 'vitest'
import { SP_BOUNDS, isInsideSpBounds } from '../../lib/sp-bounds'

describe('isInsideSpBounds', () => {
  it('aceita o centro de São Paulo', () => {
    expect(isInsideSpBounds(-23.5505, -46.6333)).toBe(true)
  })

  it('aceita cidades vizinhas da Grande SP', () => {
    expect(isInsideSpBounds(-23.4628, -46.5333)).toBe(true) // Guarulhos
    expect(isInsideSpBounds(-23.6639, -46.5383)).toBe(true) // São Bernardo
  })

  it('rejeita outras cidades', () => {
    expect(isInsideSpBounds(-22.9068, -43.1729)).toBe(false) // Rio de Janeiro
    expect(isInsideSpBounds(-23.5503, -46.6339 - 1)).toBe(false) // longitude fora
    expect(isInsideSpBounds(-19.9167, -43.9345)).toBe(false) // Belo Horizonte
  })

  it('aceita exatamente os limites', () => {
    expect(isInsideSpBounds(SP_BOUNDS.latMin, SP_BOUNDS.lngMin)).toBe(true)
    expect(isInsideSpBounds(SP_BOUNDS.latMax, SP_BOUNDS.lngMax)).toBe(true)
  })
})
