import type { GroupRecord, SuggestionGroupPayload } from '../types/suggestion'
import { getRhythmFromDistanceAndDuration } from './time'

/**
 * Estado dos inputs dos forms. Campos de texto são string; nos campos com
 * `<input type="number">` o v-model do Vue entrega `number` assim que o campo
 * é editado — o tipo reflete isso e a conversão final acontece no submit.
 */
export type SuggestionFormFields = {
  name: string
  linkUrl: string
  address: string
  day: string
  startHour: string
  effort: string
  distanceKm: string | number
  rhythmKmH: string | number
  /** Duração aproximada do pedal no formato "HH:MM". Não vai ao payload — só
   *  deriva o `rhythmKmH` quando a pessoa não sabe o ritmo em km/h. */
  durationHhmm: string
  latitude: string | number
  longitude: string | number
}

type NumericField = 'distanceKm' | 'rhythmKmH' | 'latitude' | 'longitude'
type TextField = 'name' | 'linkUrl' | 'address' | 'day' | 'startHour' | 'effort'

const NUMERIC_FIELDS: ReadonlyArray<NumericField> = [
  'distanceKm',
  'rhythmKmH',
  'latitude',
  'longitude',
]
const TEXT_FIELDS: ReadonlyArray<TextField> = [
  'name',
  'linkUrl',
  'address',
  'day',
  'startHour',
  'effort',
]

export function emptyFields(): SuggestionFormFields {
  return {
    name: '',
    linkUrl: '',
    address: '',
    day: '',
    startHour: '',
    effort: '',
    distanceKm: '',
    rhythmKmH: '',
    durationHhmm: '',
    latitude: '',
    longitude: '',
  }
}

export function fieldsFromRecord(record: GroupRecord): SuggestionFormFields {
  return {
    name: record.name,
    linkUrl: record.linkUrl ?? '',
    address: record.address ?? '',
    day: record.day ?? '',
    startHour: record.startHour ?? '',
    effort: record.effort ?? '',
    distanceKm:
      record.distanceKm !== undefined ? String(record.distanceKm) : '',
    rhythmKmH: record.rhythmKmH !== undefined ? String(record.rhythmKmH) : '',
    // o grupo publicado não guarda duração; o ritmo já vem preenchido acima
    durationHhmm: '',
    latitude: String(record.latitude),
    longitude: String(record.longitude),
  }
}

/** Converte valor de input em número, aceitando vírgula decimal — `undefined` se vazio/inválido. */
export function parseNumber(value: string | number): number | undefined {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined
  }
  const trimmed = value.trim()
  if (!trimmed) {
    return undefined
  }
  const parsed = Number(trimmed.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : undefined
}

/** Converte uma duração "HH:MM" em minutos — `null` se vazio ou inválido. */
export function parseDurationToMinutes(value: string): number | null {
  const match = value.trim().match(/^(\d{1,2}):([0-5]\d)$/)
  if (!match) {
    return null
  }
  const total = Number(match[1]) * 60 + Number(match[2])
  return total > 0 ? total : null
}

/**
 * A agenda traz os cinco campos exigidos (dia/horário/nível/distância/ritmo)?
 * Espelha a regra do servidor (`SCHEDULE_FIELDS` em suggestion-schemas) para o
 * fluxo "adicionar agenda" avisar cedo, antes do round-trip. O servidor continua
 * sendo a fonte de verdade.
 */
export function hasCompleteSchedule(payload: SuggestionGroupPayload): boolean {
  return (
    payload.day !== undefined &&
    payload.startHour !== undefined &&
    payload.effort !== undefined &&
    payload.distanceKm !== undefined &&
    payload.rhythmKmH !== undefined
  )
}

/** Converte os inputs em payload, descartando campos vazios. */
export function payloadFromFields(
  fields: SuggestionFormFields,
): SuggestionGroupPayload {
  const payload: SuggestionGroupPayload = {}

  for (const field of TEXT_FIELDS) {
    const value = fields[field].trim()
    if (value) {
      payload[field] = value
    }
  }
  for (const field of NUMERIC_FIELDS) {
    const value = parseNumber(fields[field])
    if (value !== undefined) {
      payload[field] = value
    }
  }

  // Sem ritmo digitado: deriva pela distância + duração informada (HH:MM).
  // O ritmo digitado tem precedência; a duração não é persistida no payload.
  // (convenção: `parseNumber` devolve `undefined`; `parseDurationToMinutes` e
  //  `getRhythmFromDistanceAndDuration` devolvem `null` — por isso os checks diferem.)
  if (payload.rhythmKmH === undefined && payload.distanceKm !== undefined) {
    const durationMinutes = parseDurationToMinutes(fields.durationHhmm)
    if (durationMinutes !== null) {
      const derived = getRhythmFromDistanceAndDuration({
        distanceKm: payload.distanceKm,
        durationMinutes,
      })
      if (derived !== null) {
        payload.rhythmKmH = derived
      }
    }
  }

  return payload
}

/**
 * Correction payload: only the fields whose value differs from the published record,
 * so curation sees exactly what changed. A field left empty counts as
 * "unchanged" (asking to clear a field goes in the justification).
 */
export function diffPayload(
  fields: SuggestionFormFields,
  record: GroupRecord,
): SuggestionGroupPayload {
  const proposed = payloadFromFields(fields)
  const diff: SuggestionGroupPayload = {}

  for (const field of TEXT_FIELDS) {
    const value = proposed[field]
    if (value !== undefined && value !== (record[field] ?? '')) {
      diff[field] = value
    }
  }
  for (const field of NUMERIC_FIELDS) {
    const value = proposed[field]
    if (value !== undefined && value !== record[field]) {
      diff[field] = value
    }
  }

  return diff
}
