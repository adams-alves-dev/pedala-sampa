import { describe, expect, it } from 'vitest'
import { FLY_ZOOM, SHEET_OVERLAP, buildFitOptions, groupsToPoints } from '../../lib/map-bounds'

describe('groupsToPoints', () => {
  it('retorna lista vazia para nenhum grupo', () => {
    expect(groupsToPoints([])).toEqual([])
  })

  it('mapeia departureLocation para tuplas [lat, lng]', () => {
    const groups = [
      { departureLocation: { latitude: -23.55, longitude: -46.63 } },
      { departureLocation: { latitude: -23.6, longitude: -46.7 } },
    ]
    expect(groupsToPoints(groups)).toEqual([
      [-23.55, -46.63],
      [-23.6, -46.7],
    ])
  })
})

describe('buildFitOptions', () => {
  it('usa padding simétrico no desktop', () => {
    const options = buildFitOptions(800, false)
    expect(options.paddingTopLeft).toEqual([48, 48])
    expect(options.paddingBottomRight).toEqual([48, 48])
  })

  it('reserva a faixa do bottom sheet no mobile', () => {
    const options = buildFitOptions(800, true)
    expect(options.paddingBottomRight).toEqual([48, 800 * SHEET_OVERLAP])
  })

  it('limita o zoom ao FLY_ZOOM para não estourar com um pin só', () => {
    expect(buildFitOptions(800, false).maxZoom).toBe(FLY_ZOOM)
    expect(FLY_ZOOM).toBe(14)
  })
})
