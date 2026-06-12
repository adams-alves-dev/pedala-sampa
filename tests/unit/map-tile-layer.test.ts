import { describe, expect, it } from 'vitest'

describe('map tile config', () => {
  it('usa basemap CARTO light/dark conforme o tema', () => {
    const variantFor = (theme: string) => (theme === 'dark' ? 'dark_all' : 'light_all')
    const urlFor = (theme: string) =>
      `https://{s}.basemaps.cartocdn.com/${variantFor(theme)}/{z}/{x}/{y}{r}.png`

    expect(variantFor('light')).toBe('light_all')
    expect(variantFor('dark')).toBe('dark_all')
    expect(urlFor('dark')).toContain('basemaps.cartocdn.com/dark_all')
  })
})
