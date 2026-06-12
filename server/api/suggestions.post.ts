import { SuggestionError, createSuggestion } from '../../lib/suggestion-service'
import type { SuggestionRequest } from '../../types/suggestion'

type TurnstileVerifyResponse = {
  success: boolean
}

/** Mesmo limite do schema Zod — o token é checado aqui antes do parse do corpo. */
const TURNSTILE_TOKEN_MAX_LENGTH = 4096

let warnedMissingSiteKey = false

async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  const config = useRuntimeConfig()

  if (!config.turnstileEnabled) {
    return true
  }
  if (!config.public.turnstileSiteKey && !warnedMissingSiteKey) {
    warnedMissingSiteKey = true
    console.warn(
      '[suggestions] TURNSTILE_ENABLED=true sem NUXT_PUBLIC_TURNSTILE_SITE_KEY: o widget não renderiza no client e todo envio real falha com 400',
    )
  }
  if (!token || token.length > TURNSTILE_TOKEN_MAX_LENGTH) {
    return false
  }

  let result: TurnstileVerifyResponse
  try {
    result = await $fetch<TurnstileVerifyResponse>(
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
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: 'Bad Gateway',
      message: 'Não foi possível verificar o desafio anti-bot agora. Tente novamente em instantes.',
    })
  }

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
