import type {
  SuggestionGroupPayload,
  SuggestionType,
} from '../types/suggestion'

/** Dados de uma sugestão recém-criada, o suficiente para montar o aviso. */
export type NewSuggestionNotice = {
  id: string
  type: SuggestionType
  justification: string
  targetId?: string
  contactEmail?: string
  payload?: SuggestionGroupPayload
}

/**
 * Payload do webhook do Discord. `allowed_mentions.parse: []` neutraliza pings
 * (@everyone/@here/usuários) que possam vir no texto livre de uma sugestão — o
 * Zod tira HTML, mas não menções do Discord.
 */
export type DiscordWebhookPayload = {
  content: string
  allowed_mentions: { parse: string[] }
}

const TYPE_LABEL: Record<SuggestionType, string> = {
  CREATE: 'novo grupo',
  UPDATE: 'correção',
  DELETE: 'remoção',
}

const DISCORD_CONTENT_LIMIT = 2000

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`
}

/** Campos preenchidos do payload — usado no resumo de um UPDATE. */
function filledFields(payload: SuggestionGroupPayload): string[] {
  return Object.entries(payload)
    .filter(
      ([key, value]) =>
        key !== 'scheduleId' && value !== undefined && value !== null,
    )
    .map(([key]) => key)
}

/** Monta a mensagem do Discord a partir de uma sugestão recém-criada (puro). */
export function buildDiscordMessage(
  notice: NewSuggestionNotice,
): DiscordWebhookPayload {
  // CREATE com grupo alvo = adicionar agenda a um grupo existente
  const isAddSchedule = notice.type === 'CREATE' && Boolean(notice.targetId)
  const label = isAddSchedule ? 'nova agenda' : TYPE_LABEL[notice.type]
  const lines = [`🚲 **Nova sugestão · ${label}**`]

  if (notice.type === 'CREATE' && !isAddSchedule && notice.payload?.name) {
    lines.push(`**Grupo:** ${notice.payload.name}`)
  } else if (notice.targetId) {
    lines.push(`**Grupo alvo:** \`${notice.targetId}\``)
  }

  // correção/remoção de UMA agenda específica
  if (notice.payload?.scheduleId) {
    lines.push(`**Agenda alvo:** \`${notice.payload.scheduleId}\``)
  }

  if (isAddSchedule && notice.payload) {
    const p = notice.payload
    const parts = [p.day, p.startHour, p.effort].filter(
      (value): value is string => Boolean(value),
    )
    if (p.distanceKm !== undefined) {
      parts.push(`${p.distanceKm} km`)
    }
    if (p.rhythmKmH !== undefined) {
      parts.push(`${p.rhythmKmH} km/h`)
    }
    if (parts.length > 0) {
      lines.push(`**Agenda:** ${parts.join(' · ')}`)
    }
  } else if (notice.type === 'UPDATE' && notice.payload) {
    const fields = filledFields(notice.payload)
    if (fields.length > 0) {
      lines.push(`**Campos:** ${fields.join(', ')}`)
    }
  }

  lines.push(`**Justificativa:** ${notice.justification}`)
  if (notice.contactEmail) {
    lines.push(`**Contato:** ${notice.contactEmail}`)
  }
  lines.push(`\`id: ${notice.id}\``)

  return {
    content: truncate(lines.join('\n'), DISCORD_CONTENT_LIMIT),
    allowed_mentions: { parse: [] },
  }
}

/**
 * Transporte do aviso: recebe a URL já resolvida e a mensagem pronta. Injetável
 * para teste — o adaptador real (`server/utils/notify.ts`) usa `$fetch`.
 */
export type DiscordSender = (
  url: string,
  payload: DiscordWebhookPayload,
) => Promise<unknown>

/**
 * Decide e envia o aviso de uma sugestão (best-effort, testável por injeção):
 * no-op sem `webhookUrl`; do contrário envia a mensagem montada e **engole** o
 * erro do transporte — o cadastro da sugestão nunca é derrubado pelo aviso.
 */
export async function sendSuggestionNotice(
  webhookUrl: string | undefined,
  notice: NewSuggestionNotice,
  send: DiscordSender,
): Promise<void> {
  if (!webhookUrl) {
    return
  }
  try {
    await send(webhookUrl, buildDiscordMessage(notice))
  } catch (error) {
    // não relança: o usuário já teve a sugestão registrada com sucesso
    console.warn('[suggestions] falha ao notificar no Discord:', error)
  }
}
