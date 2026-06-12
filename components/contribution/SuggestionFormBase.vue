<template>
  <div v-if="status === 'success'" class="suggestion-success" role="status">
    <strong class="ps-h3">Sugestão enviada!</strong>
    <p class="ps-body">
      Obrigado por contribuir. Ela passará por revisão antes de ir ao ar.
    </p>
    <NuxtLink class="ps-btn" to="/">Voltar ao mapa</NuxtLink>
  </div>

  <form v-else class="suggestion-form" novalidate @submit.prevent="onSubmit">
    <slot />

    <div class="ps-field-group">
      <label class="ps-fieldlabel" :for="`${uid}-justification`">{{ justificationLabel }} *</label>
      <textarea
        :id="`${uid}-justification`"
        v-model="justification"
        class="ps-input suggestion-textarea"
        rows="4"
        required
        minlength="10"
        maxlength="1000"
        :aria-describedby="`${uid}-justification-hint`"
      />
      <p :id="`${uid}-justification-hint`" class="suggestion-hint">
        {{ justificationHint }}
      </p>
    </div>

    <div class="ps-field-group">
      <label class="ps-fieldlabel" :for="`${uid}-email`">Seu e-mail (opcional)</label>
      <input
        :id="`${uid}-email`"
        v-model="contactEmail"
        class="ps-input"
        type="email"
        autocomplete="email"
        maxlength="200"
        :aria-describedby="`${uid}-email-hint`"
      >
      <p :id="`${uid}-email-hint`" class="suggestion-hint">
        Usado apenas para avisar você sobre a revisão. Não aparece no site.
      </p>
    </div>

    <!-- honeypot: escondido de humanos; bots que preencherem são ignorados -->
    <div class="suggestion-hp" aria-hidden="true">
      <label :for="`${uid}-website`">Website</label>
      <input
        :id="`${uid}-website`"
        v-model="website"
        type="text"
        tabindex="-1"
        autocomplete="off"
      >
    </div>

    <TurnstileWidget ref="turnstileRef" @token="turnstileToken = $event" />

    <p
      v-if="status === 'error'"
      ref="errorRef"
      class="suggestion-error"
      role="alert"
      tabindex="-1"
    >
      {{ errorMessage }}
      <span v-if="issues.length">
        <br>
        <span v-for="issue in issues" :key="issue.path">— {{ issue.message }}<br></span>
      </span>
    </p>

    <button class="ps-btn ps-btn--solid suggestion-submit" type="submit" :disabled="status === 'sending'">
      {{ status === 'sending' ? 'Enviando…' : submitLabel }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { nextTick, ref, useId } from 'vue'
import { FetchError } from 'ofetch'
import type { SuggestionRequest } from '../../types/suggestion'
import TurnstileWidget from './TurnstileWidget.vue'

type CommonFields = {
  justification: string
  contactEmail: string
  turnstileToken: string
  website: string
}

const props = withDefaults(
  defineProps<{
    submitLabel: string
    justificationLabel?: string
    justificationHint?: string
    /** Monta a request a partir dos campos comuns — ou devolve um erro local. */
    buildRequest: (common: CommonFields) => SuggestionRequest | { error: string }
  }>(),
  {
    justificationLabel: 'Justificativa',
    justificationHint: 'Conte de onde veio a informação ou por que a mudança é necessária.',
  },
)

const { submitSuggestion } = useSuggestions()
const uid = useId()

const justification = ref('')
const contactEmail = ref('')
const turnstileToken = ref('')
const website = ref('')

const status = ref<'idle' | 'sending' | 'success' | 'error'>('idle')
const errorMessage = ref('')
const issues = ref<Array<{ path: string; message: string }>>([])
const errorRef = ref<HTMLElement | null>(null)
const turnstileRef = ref<InstanceType<typeof TurnstileWidget> | null>(null)

async function showError(message: string, newIssues: Array<{ path: string; message: string }> = []) {
  status.value = 'error'
  errorMessage.value = message
  issues.value = newIssues
  await nextTick()
  errorRef.value?.focus()
}

function extractIssues(data: unknown): Array<{ path: string; message: string }> {
  if (!Array.isArray(data)) {
    return []
  }
  return data.filter(
    (item): item is { path: string; message: string } =>
      typeof item === 'object' &&
      item !== null &&
      'path' in item &&
      typeof item.path === 'string' &&
      'message' in item &&
      typeof item.message === 'string',
  )
}

async function onSubmit() {
  const request = props.buildRequest({
    justification: justification.value,
    contactEmail: contactEmail.value,
    turnstileToken: turnstileToken.value,
    website: website.value,
  })

  if ('error' in request) {
    await showError(request.error)
    return
  }

  status.value = 'sending'
  try {
    await submitSuggestion(request)
    status.value = 'success'
  } catch (error) {
    // o token do Turnstile pode ter sido consumido pelo envio que falhou
    turnstileRef.value?.reset()
    if (error instanceof FetchError) {
      const message =
        typeof error.data?.message === 'string'
          ? error.data.message
          : 'Não foi possível enviar a sugestão. Tente novamente em instantes.'
      await showError(message, extractIssues(error.data?.data))
    } else {
      await showError('Não foi possível enviar a sugestão. Tente novamente em instantes.')
    }
  }
}
</script>

<style scoped>
.suggestion-form {
  display: grid;
  gap: var(--space-4);
  max-width: 560px;
}

.suggestion-textarea {
  min-height: 110px;
  resize: vertical;
  padding-top: var(--space-2);
}

.suggestion-hint {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--color-asphalt-55);
}

.suggestion-hp {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.suggestion-error {
  margin: 0;
  padding: var(--space-3);
  border: 2px solid var(--color-alert-red);
  color: var(--color-alert-red);
  font-weight: 700;
  font-size: var(--text-sm);
}

.suggestion-error:focus {
  outline: 2px solid currentcolor;
  outline-offset: 2px;
}

.suggestion-submit {
  justify-self: start;
}

.suggestion-success {
  display: grid;
  gap: var(--space-3);
  justify-items: start;
  max-width: 560px;
  padding: var(--space-5);
  border: 2px solid var(--color-bike-green);
}
</style>
