type TurnstileVerifyResponse = {
  success: boolean
}

let warnedMissingConfig = false

/**
 * Verifica o token do Cloudflare Turnstile contra o siteverify. Retorna `true`
 * quando o desafio está desligado (`TURNSTILE_ENABLED=false`); `false` quando o
 * token falta/não passa; lança 502 se o siteverify estiver indisponível. Avisa
 * uma vez no log se o flag estiver ligado sem as chaves configuradas.
 *
 * Auto-importado pelo Nitro nas server routes (igual a `notify`/`rate-limit`).
 */
export async function verifyTurnstile(
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
      `[turnstile] TURNSTILE_ENABLED=true sem ${missing}: todo envio real falha com 400`,
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
