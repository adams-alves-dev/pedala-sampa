export type SuggestionType = 'CREATE' | 'UPDATE' | 'DELETE'
export const SUGGESTION_TYPES: readonly [SuggestionType, ...SuggestionType[]] =
  ['CREATE', 'UPDATE', 'DELETE']

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
  /** Alvo (id do GroupInfo) ao corrigir/remover UMA agenda específica — não é um
   *  campo editável; viaja no Json do payload. Ausente = grupo / 1ª agenda. */
  scheduleId?: string
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

/** Uma agenda publicada (GroupInfo) no snapshot de correção — campos opcionais
 *  porque uma agenda pode estar incompleta no CMS. */
export type GroupScheduleRecord = {
  id: string
  day?: string
  startHour?: string
  effort?: string
  distanceKm?: number
  rhythmKmH?: number
}

/** Snapshot dos dados publicados de um grupo, para pré-preencher o form de
 *  correção. Campos de grupo no topo; cada agenda em `schedules`. */
export type GroupRecord = {
  id: string
  slug: string
  name: string
  linkUrl?: string
  address?: string
  latitude: number
  longitude: number
  schedules: GroupScheduleRecord[]
}
