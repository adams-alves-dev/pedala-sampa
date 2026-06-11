<template>
  <div v-if="status === 'success'" class="sugestao-success" role="status">
    <strong class="ps-h3">Sugestão enviada!</strong>
    <p class="ps-body">
      Obrigado por contribuir. Ela passará por revisão antes de ir ao ar.
    </p>
    <NuxtLink class="ps-btn" to="/">Voltar ao mapa</NuxtLink>
  </div>

  <form v-else class="sugestao-form" novalidate @submit.prevent="onSubmit">
    <slot />

    <div class="ps-field-group">
      <label class="ps-fieldlabel" :for="`${uid}-justificativa`">{{ justificativaLabel }} *</label>
      <textarea
        :id="`${uid}-justificativa`"
        v-model="justificativa"
        class="ps-input sugestao-textarea"
        rows="4"
        required
        minlength="10"
        maxlength="1000"
        :aria-describedby="`${uid}-justificativa-hint`"
      />
      <p :id="`${uid}-justificativa-hint`" class="sugestao-hint">
        {{ justificativaHint }}
      </p>
    </div>

    <div class="ps-field-group">
      <label class="ps-fieldlabel" :for="`${uid}-email`">Seu e-mail (opcional)</label>
      <input
        :id="`${uid}-email`"
        v-model="contatoEmail"
        class="ps-input"
        type="email"
        autocomplete="email"
        maxlength="200"
        :aria-describedby="`${uid}-email-hint`"
      >
      <p :id="`${uid}-email-hint`" class="sugestao-hint">
        Usado apenas para avisar você sobre a revisão. Não aparece no site.
      </p>
    </div>

    <!-- honeypot: escondido de humanos; bots que preencherem são ignorados -->
    <div class="sugestao-hp" aria-hidden="true">
      <label :for="`${uid}-website`">Website</label>
      <input
        :id="`${uid}-website`"
        v-model="website"
        type="text"
        tabindex="-1"
        autocomplete="off"
      >
    </div>

    <TurnstileWidget @token="turnstileToken = $event" />

    <p
      v-if="status === 'error'"
      ref="errorRef"
      class="sugestao-error"
      role="alert"
      tabindex="-1"
    >
      {{ errorMessage }}
      <span v-if="issues.length">
        <br>
        <span v-for="issue in issues" :key="issue.path">— {{ issue.message }}<br></span>
      </span>
    </p>

    <button class="ps-btn ps-btn--solid sugestao-submit" type="submit" :disabled="status === 'sending'">
      {{ status === 'sending' ? 'Enviando…' : submitLabel }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { nextTick, ref, useId } from 'vue'
import { FetchError } from 'ofetch'
import type { SugestaoRequest } from '../../types/sugestao'
import TurnstileWidget from './TurnstileWidget.vue'

type CommonFields = {
  justificativa: string
  contatoEmail: string
  turnstileToken: string
  website: string
}

const props = withDefaults(
  defineProps<{
    submitLabel: string
    justificativaLabel?: string
    justificativaHint?: string
    /** Monta a request a partir dos campos comuns — ou devolve um erro local. */
    buildRequest: (common: CommonFields) => SugestaoRequest | { error: string }
  }>(),
  {
    justificativaLabel: 'Justificativa',
    justificativaHint: 'Conte de onde veio a informação ou por que a mudança é necessária.',
  },
)

const { enviarSugestao } = useSugestoes()
const uid = useId()

const justificativa = ref('')
const contatoEmail = ref('')
const turnstileToken = ref('')
const website = ref('')

const status = ref<'idle' | 'sending' | 'success' | 'error'>('idle')
const errorMessage = ref('')
const issues = ref<Array<{ path: string; message: string }>>([])
const errorRef = ref<HTMLElement | null>(null)

async function mostrarErro(message: string, novasIssues: Array<{ path: string; message: string }> = []) {
  status.value = 'error'
  errorMessage.value = message
  issues.value = novasIssues
  await nextTick()
  errorRef.value?.focus()
}

function extrairIssues(data: unknown): Array<{ path: string; message: string }> {
  if (!Array.isArray(data)) {
    return []
  }
  return data.filter(
    (item): item is { path: string; message: string } =>
      typeof item === 'object' &&
      item !== null &&
      'message' in item &&
      typeof item.message === 'string',
  )
}

async function onSubmit() {
  const request = props.buildRequest({
    justificativa: justificativa.value,
    contatoEmail: contatoEmail.value,
    turnstileToken: turnstileToken.value,
    website: website.value,
  })

  if ('error' in request) {
    await mostrarErro(request.error)
    return
  }

  status.value = 'sending'
  try {
    await enviarSugestao(request)
    status.value = 'success'
  } catch (error) {
    if (error instanceof FetchError) {
      const message =
        typeof error.data?.message === 'string'
          ? error.data.message
          : 'Não foi possível enviar a sugestão. Tente novamente em instantes.'
      await mostrarErro(message, extrairIssues(error.data?.data))
    } else {
      await mostrarErro('Não foi possível enviar a sugestão. Tente novamente em instantes.')
    }
  }
}
</script>

<style scoped>
.sugestao-form {
  display: grid;
  gap: var(--space-4);
  max-width: 560px;
}

.sugestao-textarea {
  min-height: 110px;
  resize: vertical;
  padding-top: var(--space-2);
}

.sugestao-hint {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--color-asphalt-55);
}

.sugestao-hp {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.sugestao-error {
  margin: 0;
  padding: var(--space-3);
  border: 2px solid var(--color-signal-red, #c0392b);
  color: var(--color-signal-red, #c0392b);
  font-weight: 700;
  font-size: var(--text-sm);
}

.sugestao-error:focus {
  outline: 2px solid currentcolor;
  outline-offset: 2px;
}

.sugestao-submit {
  justify-self: start;
}

.sugestao-success {
  display: grid;
  gap: var(--space-3);
  justify-items: start;
  max-width: 560px;
  padding: var(--space-5);
  border: 2px solid var(--color-bike-green);
}
</style>
