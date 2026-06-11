export const SUGESTAO_TIPOS = ['CREATE', 'UPDATE', 'DELETE'] as const
export type SugestaoTipo = (typeof SUGESTAO_TIPOS)[number]

/** Campos editáveis do grupo que um visitante pode propor (criar ou corrigir). */
export type SugestaoGrupoPayload = {
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

export type SugestaoRequest = {
  tipo: SugestaoTipo
  alvoId?: string
  payload?: SugestaoGrupoPayload
  justificativa: string
  contatoEmail?: string
  /** Token do Cloudflare Turnstile (obrigatório quando o flag estiver ativo). */
  turnstileToken?: string
  /** Honeypot — humanos nunca preenchem; bots sim. */
  website?: string
}

export type SugestaoResponse = {
  ok: true
  id: string
}

/** Snapshot dos dados publicados de um grupo, para pré-preencher o form de correção. */
export type RegistroAtual = {
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
