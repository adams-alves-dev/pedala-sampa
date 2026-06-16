import { buildDiscordMessage } from '../../lib/suggestion-notification'
import type { NewSuggestionNotice } from '../../lib/suggestion-notification'

/**
 * Avisa no Discord que chegou uma sugestão. Fire-and-forget seguro: nunca lança
 * — uma falha no aviso não pode derrubar o cadastro da sugestão. No-op quando
 * `DISCORD_WEBHOOK_URL` não está configurado (o recurso é opt-in).
 */
export async function notifyNewSuggestion(
  notice: NewSuggestionNotice,
): Promise<void> {
  const webhookUrl = useRuntimeConfig().discordWebhookUrl
  if (!webhookUrl) {
    return
  }
  try {
    await $fetch(webhookUrl, {
      method: 'POST',
      body: buildDiscordMessage(notice),
    })
  } catch (error) {
    // não relança: o usuário já teve a sugestão registrada com sucesso
    console.warn('[suggestions] falha ao notificar no Discord:', error)
  }
}
