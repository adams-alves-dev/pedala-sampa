import type {
  SuggestionGroupPayload,
  SuggestionType,
} from '../types/suggestion'
import type { DiscordSender, DiscordWebhookPayload } from './discord'
import { DISCORD_CONTENT_LIMIT, truncate } from './discord'

/** Dados de uma sugestão recém-criada, o suficiente para montar o aviso. */
export type NewSuggestionNotice = {
  id: string
  type: SuggestionType
  justification: string
  targetId?: string
  /** Nome do grupo alvo, para dar contexto além do id opaco. */
  targetName?: string
  contactEmail?: string
  payload?: SuggestionGroupPayload
}

const TYPE_LABEL: Record<SuggestionType, string> = {
  CREATE: 'novo grupo',
  UPDATE: 'correção',
  DELETE: 'remoção',
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
    const ref = notice.targetName
      ? `${notice.targetName} \`${notice.targetId}\``
      : `\`${notice.targetId}\``
    lines.push(`**Grupo alvo:** ${ref}`)
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
  // id do registro Suggestion no Hygraph — o curador usa pra achar e avaliar
  // esta sugestão no Studio/CLI de curadoria; code inline facilita copiar
  lines.push(`**ID da sugestão:** \`${notice.id}\``)

  return {
    content: truncate(lines.join('\n'), DISCORD_CONTENT_LIMIT),
    allowed_mentions: { parse: [] },
  }
}

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
