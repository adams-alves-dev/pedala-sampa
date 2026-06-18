export type FeedbackRequest = {
  message: string
  contactEmail?: string
  /** Token do Cloudflare Turnstile (obrigatório quando o flag estiver ativo). */
  turnstileToken?: string
  /** Honeypot — humanos nunca preenchem; bots sim. */
  website?: string
}

export type FeedbackResponse = {
  ok: true
  id: string
}
