import {
  FeedbackError,
  createFeedback,
  parseFeedback,
} from '../../lib/feedback-service'
import type { FeedbackRequest } from '../../types/feedback'

export default defineEventHandler(async (event) => {
  const body = await readBody<FeedbackRequest>(event)
  const ip =
    getRequestHeader(event, 'x-nf-client-connection-ip') ||
    getRequestHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'

  // honeypot: bots preenchem o campo escondido; respondemos 200 sem criar nada
  if (body?.website) {
    return { ok: true, id: 'ok' }
  }

  pruneRateLimit()
  if (isRateLimited(ip)) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message:
        'Muitas mensagens em sequência. Tente novamente em alguns minutos.',
    })
  }

  try {
    // valida ANTES do Turnstile: o token do desafio é de uso único, e um 400 de
    // validação não pode consumi-lo — senão o reenvio corrigido falharia
    const parsed = parseFeedback(body)

    if (!(await verifyTurnstile(parsed.turnstileToken, ip))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message:
          'Não foi possível verificar que você é humano. Recarregue a página e tente de novo.',
      })
    }

    const result = await createFeedback(parsed, hygraphRequest)

    // aviso best-effort no Discord: nunca derruba a resposta — o feedback já foi
    // registrado. No-op se DISCORD_WEBHOOK_URL não estiver configurado.
    await notifyNewFeedback({
      id: result.id,
      message: parsed.message,
      contactEmail: parsed.contactEmail,
    })

    return result
  } catch (error) {
    if (error instanceof FeedbackError) {
      throw createError({
        statusCode: error.statusCode,
        message: error.message,
        data: error.issues,
      })
    }
    throw error
  }
})
