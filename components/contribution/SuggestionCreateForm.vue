<template>
  <SuggestionFormBase
    submit-label="Enviar sugestão de grupo"
    justification-label="Sobre o grupo"
    justification-hint="Conte como conhece o grupo e de onde vieram as informações."
    :build-request="buildRequest"
  >
    <SuggestionGroupFields v-model="fields" required />
  </SuggestionFormBase>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { emptyFields, payloadFromFields } from '../../lib/suggestion-form'
import type { SuggestionRequest } from '../../types/suggestion'
import SuggestionFormBase from './SuggestionFormBase.vue'
import SuggestionGroupFields from './SuggestionGroupFields.vue'

const fields = ref(emptyFields())

function buildRequest(common: {
  justification: string
  contactEmail: string
  turnstileToken: string
  website: string
}): SuggestionRequest | { error: string } {
  const payload = payloadFromFields(fields.value)

  if (!payload.name || payload.latitude === undefined || payload.longitude === undefined) {
    return { error: 'Preencha pelo menos o nome do grupo e as coordenadas do ponto de saída.' }
  }

  return {
    type: 'CREATE',
    payload,
    ...common,
  }
}
</script>
