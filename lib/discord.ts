/**
 * Payload do webhook do Discord. `allowed_mentions.parse: []` neutraliza pings
 * (@everyone/@here/usuários) que possam vir do texto livre do usuário — o Zod
 * tira HTML, mas não menções do Discord.
 */
export type DiscordWebhookPayload = {
  content: string
  allowed_mentions: { parse: string[] }
}

/** Limite de caracteres do campo `content` de uma mensagem do Discord. */
export const DISCORD_CONTENT_LIMIT = 2000

/** Trunca para `max`, com reticências quando estoura. */
export function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`
}

/**
 * Transporte do aviso: recebe a URL já resolvida e a mensagem pronta. Injetável
 * para teste — o adaptador real (`server/utils/notify.ts`) usa `$fetch`.
 */
export type DiscordSender = (
  url: string,
  payload: DiscordWebhookPayload,
) => Promise<unknown>
