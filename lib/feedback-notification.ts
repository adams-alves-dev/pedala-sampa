import type { DiscordSender, DiscordWebhookPayload } from './discord'
import { DISCORD_CONTENT_LIMIT, truncate } from './discord'

/** Dados de um feedback recém-registrado, o suficiente para montar o aviso. */
export type NewFeedbackNotice = {
  id: string
  message: string
  contactEmail?: string
}

/** Monta a mensagem do Discord a partir de um feedback recém-criado (puro). */
export function buildFeedbackMessage(
  notice: NewFeedbackNotice,
): DiscordWebhookPayload {
  const lines = ['💬 **Novo feedback**']
  // trunca a mensagem no aviso para sobrar espaço p/ contato e id (o texto
  // completo fica no registro do Hygraph); o truncate final protege o limite global
  lines.push(`**Mensagem:** ${truncate(notice.message, 1500)}`)
  if (notice.contactEmail) {
    lines.push(`**Contato:** ${notice.contactEmail}`)
  }
  // id do registro Feedback no Hygraph — a equipe usa pra achar e tratar no Studio
  lines.push(`**ID:** \`${notice.id}\``)

  return {
    content: truncate(lines.join('\n'), DISCORD_CONTENT_LIMIT),
    allowed_mentions: { parse: [] },
  }
}

/**
 * Decide e envia o aviso de um feedback (best-effort, testável por injeção):
 * no-op sem `webhookUrl`; do contrário envia a mensagem montada e **engole** o
 * erro do transporte — o registro do feedback nunca é derrubado pelo aviso.
 */
export async function sendFeedbackNotice(
  webhookUrl: string | undefined,
  notice: NewFeedbackNotice,
  send: DiscordSender,
): Promise<void> {
  if (!webhookUrl) {
    return
  }
  try {
    await send(webhookUrl, buildFeedbackMessage(notice))
  } catch (error) {
    // não relança: o usuário já teve o feedback registrado com sucesso
    console.warn('[feedback] falha ao notificar no Discord:', error)
  }
}
