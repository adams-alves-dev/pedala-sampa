import { SuggestionError, createSuggestion } from '../../lib/suggestion-service'
import type { SuggestionRequest } from '../../types/suggestion'

type TurnstileVerifyResponse = {
  success: boolean
}

async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  const config = useRuntimeConfig()

  if (!config.turnstileEnabled) {
    return true
  }
  if (!token) {
    return false
  }

  const result = await $fetch<TurnstileVerifyResponse>(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      body: {
        secret: config.turnstileSecretKey,
        response: token,
        remoteip: ip,
      },
    },
  )

  return result.success
}

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
      message: 'Muitas sugestões em sequência. Tente novamente em alguns minutos.',
    })
  }

  if (!(await verifyTurnstile(body?.turnstileToken, ip))) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Não foi possível verificar que você é humano. Recarregue a página e tente de novo.',
    })
  }

  try {
    return await createSuggestion(body, hygraphRequest)
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
