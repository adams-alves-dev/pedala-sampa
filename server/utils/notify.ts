import { sendSuggestionNotice } from '../../lib/suggestion-notification'
import type { NewSuggestionNotice } from '../../lib/suggestion-notification'

// Timeout curto do POST ao Discord: o aviso é awaitado antes da resposta, então
// um Discord lento/pendurado não pode segurar o envio do formulário do usuário.
const DISCORD_TIMEOUT_MS = 3000

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
    (url, payload) =>
      $fetch(url, {
        method: 'POST',
        body: payload,
        timeout: DISCORD_TIMEOUT_MS,
      }),
  )
}
