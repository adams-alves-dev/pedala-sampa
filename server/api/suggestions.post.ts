import {
  SuggestionError,
  createSuggestion,
  parseSuggestion,
} from '../../lib/suggestion-service'
import type { SuggestionRequest } from '../../types/suggestion'

export default defineEventHandler(async (event) => {
  const body = await readBody<SuggestionRequest>(event)
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
        'Muitas sugestões em sequência. Tente novamente em alguns minutos.',
    })
  }

  try {
    // valida ANTES do Turnstile: o token do desafio é de uso único, e um 400 de
    // validação não pode consumi-lo — senão o reenvio corrigido falharia
    const parsed = parseSuggestion(body)

    if (!(await verifyTurnstile(parsed.turnstileToken, ip))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message:
          'Não foi possível verificar que você é humano. Recarregue a página e tente de novo.',
      })
    }

    const result = await createSuggestion(parsed, hygraphRequest)

    // aviso best-effort no Discord: awaitado (com timeout curto) para o serverless
    // não congelar antes do POST, mas nunca derruba a resposta — a sugestão já foi
    // registrada. No-op se DISCORD_WEBHOOK_URL não estiver configurado.
    await notifyNewSuggestion({
      id: result.id,
      type: parsed.type,
      justification: parsed.justification,
      targetId: parsed.targetId,
      targetName: result.targetName,
      contactEmail: parsed.contactEmail,
      payload: parsed.payload,
    })

    return result
  } catch (error) {
    if (error instanceof SuggestionError) {
      throw createError({
        statusCode: error.statusCode,
        message: error.message,
        data: error.issues,
      })
    }
    throw error
  }
})
