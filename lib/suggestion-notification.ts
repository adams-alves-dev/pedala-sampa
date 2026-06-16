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
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key]) => key)
}

/** Monta a mensagem do Discord a partir de uma sugestão recém-criada (puro). */
export function buildDiscordMessage(
  notice: NewSuggestionNotice,
): DiscordWebhookPayload {
  const lines = [`🚲 **Nova sugestão · ${TYPE_LABEL[notice.type]}**`]

  if (notice.type === 'CREATE' && notice.payload?.name) {
    lines.push(`**Grupo:** ${notice.payload.name}`)
  } else if (notice.targetId) {
    lines.push(`**Grupo alvo:** \`${notice.targetId}\``)
  }

  if (notice.type === 'UPDATE' && notice.payload) {
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
