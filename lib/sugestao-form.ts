import type { RegistroAtual, SugestaoGrupoPayload } from '../types/sugestao'

/** Estado dos inputs dos forms — tudo string; a conversão acontece no submit. */
export type SugestaoFormFields = {
  name: string
  linkUrl: string
  address: string
  day: string
  startHour: string
  effort: string
  distanceKm: string
  rhythmKmH: string
  latitude: string
  longitude: string
}

const NUMERIC_FIELDS = ['distanceKm', 'rhythmKmH', 'latitude', 'longitude'] as const
const TEXT_FIELDS = ['name', 'linkUrl', 'address', 'day', 'startHour', 'effort'] as const

export function emptyFields(): SugestaoFormFields {
  return {
    name: '',
    linkUrl: '',
    address: '',
    day: '',
    startHour: '',
    effort: '',
    distanceKm: '',
    rhythmKmH: '',
    latitude: '',
    longitude: '',
  }
}

export function fieldsFromRegistro(registro: RegistroAtual): SugestaoFormFields {
  return {
    name: registro.name,
    linkUrl: registro.linkUrl ?? '',
    address: registro.address ?? '',
    day: registro.day ?? '',
    startHour: registro.startHour ?? '',
    effort: registro.effort ?? '',
    distanceKm: registro.distanceKm !== undefined ? String(registro.distanceKm) : '',
    rhythmKmH: registro.rhythmKmH !== undefined ? String(registro.rhythmKmH) : '',
    latitude: String(registro.latitude),
    longitude: String(registro.longitude),
  }
}

function parseNumero(value: string): number | undefined {
  const trimmed = value.trim()
  if (!trimmed) {
    return undefined
  }
  const parsed = Number(trimmed.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : undefined
}

/** Converte os inputs em payload, descartando campos vazios. */
export function payloadFromFields(fields: SugestaoFormFields): SugestaoGrupoPayload {
  const payload: SugestaoGrupoPayload = {}

  for (const campo of TEXT_FIELDS) {
    const value = fields[campo].trim()
    if (value) {
      payload[campo] = value
    }
  }
  for (const campo of NUMERIC_FIELDS) {
    const value = parseNumero(fields[campo])
    if (value !== undefined) {
      payload[campo] = value
    }
  }

  return payload
}

/**
 * Payload de correção: só os campos cujo valor difere do registro publicado,
 * para a curadoria ver exatamente o que mudou. Campo deixado vazio conta como
 * "sem alteração" (pedido de limpeza de campo vai na justificativa).
 */
export function diffPayload(
  fields: SugestaoFormFields,
  registro: RegistroAtual,
): SugestaoGrupoPayload {
  const proposto = payloadFromFields(fields)
  const diff: SugestaoGrupoPayload = {}

  for (const campo of TEXT_FIELDS) {
    const value = proposto[campo]
    if (value !== undefined && value !== (registro[campo] ?? '')) {
      diff[campo] = value
    }
  }
  for (const campo of NUMERIC_FIELDS) {
    const value = proposto[campo]
    if (value !== undefined && value !== registro[campo]) {
      diff[campo] = value
    }
  }

  return diff
}
