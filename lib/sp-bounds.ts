/**
 * Limites geográficos generosos da Grande São Paulo — pontos de saída em
 * cidades vizinhas (ABC, Guarulhos, Osasco) são válidos.
 *
 * Módulo sem dependências de propósito: é usado tanto pela validação Zod no
 * server quanto pelo LocationPicker no client (que não pode puxar Zod).
 */
export const SP_BOUNDS = {
  latMin: -24.2,
  latMax: -23.2,
  lngMin: -47.2,
  lngMax: -46.0,
}

export function isInsideSpBounds(latitude: number, longitude: number): boolean {
  return (
    latitude >= SP_BOUNDS.latMin &&
    latitude <= SP_BOUNDS.latMax &&
    longitude >= SP_BOUNDS.lngMin &&
    longitude <= SP_BOUNDS.lngMax
  )
}
