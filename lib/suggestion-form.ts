import type { GroupRecord, SuggestionGroupPayload } from '../types/suggestion'

/** Estado dos inputs dos forms — tudo string; a conversão acontece no submit. */
export type SuggestionFormFields = {
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

type NumericField = 'distanceKm' | 'rhythmKmH' | 'latitude' | 'longitude'
type TextField = 'name' | 'linkUrl' | 'address' | 'day' | 'startHour' | 'effort'

const NUMERIC_FIELDS: ReadonlyArray<NumericField> = ['distanceKm', 'rhythmKmH', 'latitude', 'longitude']
const TEXT_FIELDS: ReadonlyArray<TextField> = ['name', 'linkUrl', 'address', 'day', 'startHour', 'effort']

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
    distanceKm: record.distanceKm !== undefined ? String(record.distanceKm) : '',
    rhythmKmH: record.rhythmKmH !== undefined ? String(record.rhythmKmH) : '',
    latitude: String(record.latitude),
    longitude: String(record.longitude),
  }
}

function parseNumber(value: string): number | undefined {
  const trimmed = value.trim()
  if (!trimmed) {
    return undefined
  }
  const parsed = Number(trimmed.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : undefined
}

/** Converte os inputs em payload, descartando campos vazios. */
export function payloadFromFields(fields: SuggestionFormFields): SuggestionGroupPayload {
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
