export const SUGGESTION_TYPES = ['CREATE', 'UPDATE', 'DELETE'] as const
export type SuggestionType = (typeof SUGGESTION_TYPES)[number]

/** Campos editáveis do grupo que um visitante pode propor (criar ou corrigir). */
export type SuggestionGroupPayload = {
  name?: string
  linkUrl?: string
  address?: string
  day?: string
  startHour?: string
  effort?: string
  distanceKm?: number
  rhythmKmH?: number
  latitude?: number
  longitude?: number
}

export type SuggestionRequest = {
  type: SuggestionType
  targetId?: string
  payload?: SuggestionGroupPayload
  justification: string
  contactEmail?: string
  /** Token do Cloudflare Turnstile (obrigatório quando o flag estiver ativo). */
  turnstileToken?: string
  /** Honeypot — humanos nunca preenchem; bots sim. */
  website?: string
}

export type SuggestionResponse = {
  ok: true
  id: string
}

/** Snapshot dos dados publicados de um grupo, para pré-preencher o form de correção. */
export type GroupRecord = {
  id: string
  slug: string
  name: string
  linkUrl?: string
  address?: string
  day?: string
  startHour?: string
  effort?: string
  distanceKm?: number
  rhythmKmH?: number
  latitude: number
  longitude: number
}
