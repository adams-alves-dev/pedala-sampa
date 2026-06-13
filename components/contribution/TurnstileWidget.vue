<template>
  <div v-if="siteKey" ref="widgetRef" class="turnstile" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

type TurnstileApi = {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string
      callback: (token: string) => void
      'expired-callback'?: () => void
    },
  ) => string
  reset: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const emit = defineEmits<{
  token: [value: string]
}>()

const config = useRuntimeConfig()
const siteKey = config.public.turnstileSiteKey
const widgetRef = ref<HTMLElement | null>(null)

function loadTurnstile(): Promise<TurnstileApi> {
  return new Promise((resolve, reject) => {
    if (window.turnstile) {
      resolve(window.turnstile)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.onload = () => {
      if (window.turnstile) {
        resolve(window.turnstile)
      } else {
        reject(new Error('Turnstile não inicializou'))
      }
    }
    script.onerror = () => reject(new Error('Falha ao carregar o Turnstile'))
    document.head.appendChild(script)
  })
}

let api: TurnstileApi | null = null
let widgetId: string | null = null

onMounted(async () => {
  if (!siteKey || !widgetRef.value) {
    return
  }
  try {
    api = await loadTurnstile()
    widgetId = api.render(widgetRef.value, {
      sitekey: siteKey,
      callback: (token) => emit('token', token),
      'expired-callback': () => emit('token', ''),
    })
  } catch {
    // sem widget o server ainda decide pelo flag TURNSTILE_ENABLED
  }
})

/** Tokens do Turnstile são de uso único — o form reseta o widget após erro de envio. */
function reset() {
  if (api && widgetId !== null) {
    api.reset(widgetId)
    emit('token', '')
  }
}

defineExpose({ reset })
</script>

<style scoped>
.turnstile {
  min-height: 0;
}
</style>
