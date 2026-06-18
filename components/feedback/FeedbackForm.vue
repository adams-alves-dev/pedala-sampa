<template>
  <div v-if="status === 'success'" class="feedback-success" role="status">
    <strong class="ps-h3">Mensagem enviada!</strong>
    <p class="ps-body">
      Obrigado por escrever. Se você deixou um e-mail, podemos responder por lá.
    </p>
  </div>

  <form v-else class="feedback-form" novalidate @submit.prevent="onSubmit">
    <div class="ps-field-group">
      <label class="ps-fieldlabel" :for="`${uid}-message`"
        >Sua mensagem *</label
      >
      <textarea
        :id="`${uid}-message`"
        v-model="message"
        class="ps-input feedback-textarea"
        rows="5"
        required
        minlength="10"
        maxlength="2000"
        :aria-describedby="`${uid}-message-hint`"
      />
      <p :id="`${uid}-message-hint`" class="feedback-hint">
        Dúvidas, ideias, problemas no site ou qualquer comentário — mínimo de 10
        caracteres. Para sugerir ou corrigir um grupo, use os botões acima.
      </p>
    </div>

    <div class="ps-field-group">
      <label class="ps-fieldlabel" :for="`${uid}-email`"
        >Seu e-mail (opcional)</label
      >
      <input
        :id="`${uid}-email`"
        v-model="contactEmail"
        class="ps-input"
        type="email"
        autocomplete="email"
        maxlength="200"
        :aria-describedby="`${uid}-email-hint`"
      />
      <p :id="`${uid}-email-hint`" class="feedback-hint">
        Usado apenas para responder você. Veja como tratamos seus dados na
        <NuxtLink to="/privacy">Política de Privacidade</NuxtLink>.
      </p>
    </div>

    <!-- honeypot: escondido de humanos; bots que preencherem são ignorados -->
    <div class="feedback-hp" aria-hidden="true">
      <label :for="`${uid}-website`">Website</label>
      <input
        :id="`${uid}-website`"
        v-model="website"
        type="text"
        tabindex="-1"
        autocomplete="off"
      />
    </div>

    <TurnstileWidget ref="turnstileRef" @token="turnstileToken = $event" />

    <p
      v-if="status === 'error'"
      ref="errorRef"
      class="feedback-error"
      role="alert"
      tabindex="-1"
    >
      {{ errorMessage }}
      <span v-if="issues.length">
        <br />
        <span v-for="issue in issues" :key="issue.path"
          >— {{ issue.message }}<br
        /></span>
      </span>
    </p>

    <p class="feedback-consent">
      Ao enviar, você concorda com a
      <NuxtLink to="/privacy">Política de Privacidade</NuxtLink> e os
      <NuxtLink to="/terms">Termos de Uso</NuxtLink>.
    </p>

    <button
      class="ps-btn ps-btn--solid feedback-submit"
      type="submit"
      :disabled="status === 'sending'"
    >
      {{ status === 'sending' ? 'Enviando…' : 'Enviar mensagem' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { nextTick, ref, useId } from 'vue'
import { FetchError } from 'ofetch'
import { extractIssues } from '../../lib/form-errors'
import type { FormIssue } from '../../lib/form-errors'
import TurnstileWidget from '../contribution/TurnstileWidget.vue'

const { submitFeedback } = useFeedback()
const uid = useId()

const message = ref('')
const contactEmail = ref('')
const turnstileToken = ref('')
const website = ref('')

const status = ref<'idle' | 'sending' | 'success' | 'error'>('idle')
const errorMessage = ref('')
const issues = ref<FormIssue[]>([])
const errorRef = ref<HTMLElement | null>(null)
const turnstileRef = ref<InstanceType<typeof TurnstileWidget> | null>(null)

async function showError(text: string, newIssues: FormIssue[] = []) {
  status.value = 'error'
  errorMessage.value = text
  issues.value = newIssues
  await nextTick()
  errorRef.value?.focus()
}

async function onSubmit() {
  // checagem local rápida — o servidor revalida (e sanitiza) de qualquer forma
  if (message.value.trim().length < 10) {
    await showError('Escreva uma mensagem com pelo menos 10 caracteres.')
    return
  }

  status.value = 'sending'
  try {
    await submitFeedback({
      message: message.value,
      contactEmail: contactEmail.value,
      turnstileToken: turnstileToken.value,
      website: website.value,
    })
    status.value = 'success'
  } catch (error) {
    // o token do Turnstile pode ter sido consumido pelo envio que falhou
    turnstileRef.value?.reset()
    if (error instanceof FetchError) {
      const apiMessage =
        typeof error.data?.message === 'string'
          ? error.data.message
          : 'Não foi possível enviar a mensagem. Tente novamente em instantes.'
      await showError(apiMessage, extractIssues(error.data?.data))
    } else {
      await showError(
        'Não foi possível enviar a mensagem. Tente novamente em instantes.',
      )
    }
  }
}
</script>

<style scoped>
.feedback-form {
  display: grid;
  gap: var(--space-4);
  max-width: 560px;
}

.feedback-textarea {
  min-height: 130px;
  resize: vertical;
  padding-top: var(--space-2);
}

.feedback-hint {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--color-asphalt-55);
}

.feedback-hp {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.feedback-error {
  margin: 0;
  padding: var(--space-3);
  border: 2px solid var(--color-alert-red);
  color: var(--color-alert-red);
  font-weight: 700;
  font-size: var(--text-sm);
}

.feedback-error:focus {
  outline: 2px solid currentcolor;
  outline-offset: 2px;
}

.feedback-consent {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--color-asphalt-55);
}

.feedback-submit {
  justify-self: start;
}

.feedback-success {
  display: grid;
  gap: var(--space-3);
  justify-items: start;
  max-width: 560px;
  padding: var(--space-5);
  border: 2px solid var(--color-bike-green);
}
</style>
