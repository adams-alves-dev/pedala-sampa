import {
  SuggestionError,
  createSuggestion,
  parseSuggestion,
} from '../../lib/suggestion-service'
import type { SuggestionRequest } from '../../types/suggestion'

type TurnstileVerifyResponse = {
  success: boolean
}

let warnedMissingConfig = false

async function verifyTurnstile(
  token: string | undefined,
  ip: string,
): Promise<boolean> {
  const config = useRuntimeConfig()

  if (!config.turnstileEnabled) {
    return true
  }
  if (
    (!config.public.turnstileSiteKey || !config.turnstileSecretKey) &&
    !warnedMissingConfig
  ) {
    warnedMissingConfig = true
    const missing = [
      config.public.turnstileSiteKey ? '' : 'NUXT_PUBLIC_TURNSTILE_SITE_KEY',
      config.turnstileSecretKey ? '' : 'TURNSTILE_SECRET_KEY',
    ]
      .filter(Boolean)
      .join(' e ')
    console.warn(
      `[suggestions] TURNSTILE_ENABLED=true sem ${missing}: todo envio real falha com 400`,
    )
  }
  if (!token) {
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
      message:
        'Não foi possível verificar o desafio anti-bot agora. Tente novamente em instantes.',
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

    const result = await createSuggestion(body, hygraphRequest)

    // aviso best-effort no Discord: awaitado (com timeout curto) para o serverless
    // não congelar antes do POST, mas nunca derruba a resposta — a sugestão já foi
    // registrada. No-op se DISCORD_WEBHOOK_URL não estiver configurado.
    await notifyNewSuggestion({
      id: result.id,
      type: parsed.type,
      justification: parsed.justification,
      targetId: parsed.targetId,
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
