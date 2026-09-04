/** CARTO raster basemap variants, one per color mode (Ciclovia → light, Noturno → dark). */
export type TileVariant = 'light_all' | 'dark_all'

/** CARTO's CDN serves tiles from four subdomains; OSM's from three. */
export const CARTO_SUBDOMAINS = 'abcd'
export const OSM_SUBDOMAINS = 'abc'

const OSM_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

export function variantFor(theme: string): TileVariant {
  return theme === 'dark' ? 'dark_all' : 'light_all'
}

/**
 * CARTO raster basemaps now require an API key (free, fair use). With a key the
 * URL carries it; without one we fall back to standard OSM tiles so the map
 * never renders CARTO's "API KEY REQUIRED" watermark.
 */
export function buildTileUrl(variant: TileVariant, apiKey?: string): string {
  if (!apiKey) return OSM_URL
  return `https://{s}.basemaps.cartocdn.com/${variant}/{z}/{x}/{y}{r}.png?key=${apiKey}`
}
