<template>
  <SugestaoFormBase
    submit-label="Enviar sugestão de grupo"
    justificativa-label="Sobre o grupo"
    justificativa-hint="Conte como conhece o grupo e de onde vieram as informações."
    :build-request="buildRequest"
  >
    <SugestaoGroupFields v-model="fields" required />
  </SugestaoFormBase>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { emptyFields, payloadFromFields } from '../../lib/sugestao-form'
import type { SugestaoRequest } from '../../types/sugestao'
import SugestaoFormBase from './SugestaoFormBase.vue'
import SugestaoGroupFields from './SugestaoGroupFields.vue'

const fields = ref(emptyFields())

function buildRequest(common: {
  justificativa: string
  contatoEmail: string
  turnstileToken: string
  website: string
}): SugestaoRequest | { error: string } {
  const payload = payloadFromFields(fields.value)

  if (!payload.name || payload.latitude === undefined || payload.longitude === undefined) {
    return { error: 'Preencha pelo menos o nome do grupo e as coordenadas do ponto de saída.' }
  }

  return {
    tipo: 'CREATE',
    payload,
    ...common,
  }
}
</script>
