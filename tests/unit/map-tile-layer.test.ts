import { describe, expect, it } from 'vitest'
import {
  buildTileUrl,
  variantFor,
  CARTO_SUBDOMAINS,
  OSM_SUBDOMAINS,
} from '../../lib/map-tiles'

describe('map tile config', () => {
  it('mapeia tema para a variante CARTO light/dark', () => {
    expect(variantFor('light')).toBe('light_all')
    expect(variantFor('dark')).toBe('dark_all')
  })

  it('com key, usa o basemap CARTO com ?key=', () => {
    const url = buildTileUrl(variantFor('dark'), 'KEY')
    expect(url).toContain('basemaps.cartocdn.com/dark_all')
    expect(url).toContain('key=KEY')
  })

  it('sem key, cai para tiles OSM (sem marca d\u00e1gua da CARTO)', () => {
    for (const variant of [variantFor('light'), variantFor('dark')]) {
      const url = buildTileUrl(variant, '')
      expect(url).toContain('tile.openstreetmap.org/{z}/{x}/{y}.png')
      expect(url).not.toContain('cartocdn')
    }
  })

  it('declara os subdomains corretos por provedor', () => {
    expect(CARTO_SUBDOMAINS).toBe('abcd')
    expect(OSM_SUBDOMAINS).toBe('abc')
  })
})
