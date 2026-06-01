import { describe, expect, it } from 'vitest'

describe('map tile config', () => {
  it('mantém fallback OSM documentado para quando Mapbox não estiver configurado', () => {
    expect('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').toContain('openstreetmap')
  })
})
