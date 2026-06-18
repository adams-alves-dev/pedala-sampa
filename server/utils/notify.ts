import { sendSuggestionNotice } from '../../lib/suggestion-notification'
import type { NewSuggestionNotice } from '../../lib/suggestion-notification'
import { sendFeedbackNotice } from '../../lib/feedback-notification'
import type { NewFeedbackNotice } from '../../lib/feedback-notification'
import type { DiscordWebhookPayload } from '../../lib/discord'

// Timeout curto do POST ao Discord: o aviso é awaitado antes da resposta, então
// um Discord lento/pendurado não pode segurar o envio do formulário do usuário.
const DISCORD_TIMEOUT_MS = 3000

/** Adaptador real do transporte: posta a mensagem pronta no webhook via `$fetch`. */
function postToDiscord(url: string, payload: DiscordWebhookPayload) {
  return $fetch(url, {
    method: 'POST',
    body: payload,
    timeout: DISCORD_TIMEOUT_MS,
  })
}

/**
 * Avisa no Discord que chegou uma sugestão. Best-effort: nunca lança (uma falha
 * no aviso não derruba o cadastro) e tem timeout curto para não atrasar a
 * resposta. No-op quando `DISCORD_WEBHOOK_URL` não está configurado (opt-in).
 */
export function notifyNewSuggestion(
  notice: NewSuggestionNotice,
): Promise<void> {
  return sendSuggestionNotice(
    useRuntimeConfig().discordWebhookUrl,
    notice,
    postToDiscord,
  )
}

/**
 * Avisa no Discord que chegou um feedback. Mesmas garantias do aviso de sugestão
 * (best-effort, timeout curto, no-op sem `DISCORD_WEBHOOK_URL`).
 */
export function notifyNewFeedback(notice: NewFeedbackNotice): Promise<void> {
  return sendFeedbackNotice(
    useRuntimeConfig().discordWebhookUrl,
    notice,
    postToDiscord,
  )
}
