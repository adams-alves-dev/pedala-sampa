<template>
  <p v-if="pending" class="ps-body" role="status">Carregando dados do grupo…</p>

  <div v-else-if="!registro" class="sugestao-notfound">
    <p class="ps-body">Não encontramos esse grupo. Ele pode ter sido removido.</p>
    <NuxtLink class="ps-btn" to="/">Voltar ao mapa</NuxtLink>
  </div>

  <div v-else>
    <p class="ps-body sugestao-intro">
      Os campos abaixo mostram o que está publicado para
      <strong>{{ registro.name }}</strong>. Altere só o que precisa corrigir — enviamos para
      revisão apenas o que mudou.
    </p>

    <SugestaoFormBase
      submit-label="Enviar correção"
      justificativa-hint="Conte de onde veio a informação corrigida (ex.: sou do grupo, o ponto mudou)."
      :build-request="buildRequest"
    >
      <SugestaoGroupFields v-model="fields" />
    </SugestaoFormBase>

    <p class="ps-body sugestao-remocao">
      O grupo não existe mais ou não quer aparecer no site?
      <NuxtLink :to="`/contribuir/remocao/${registro.slug}`">Solicitar remoção</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { diffPayload, emptyFields, fieldsFromRegistro } from '../../lib/sugestao-form'
import type { SugestaoRequest } from '../../types/sugestao'
import SugestaoFormBase from './SugestaoFormBase.vue'
import SugestaoGroupFields from './SugestaoGroupFields.vue'

const props = defineProps<{
  slug: string
}>()

const { buscarRegistro } = useSugestoes()

// busca só no client: a página é prerenderizada como casca estática
const { data: registro, pending } = useAsyncData(
  `registro:${props.slug}`,
  () => buscarRegistro(props.slug).catch(() => null),
  { server: false, default: () => null },
)

const fields = ref(emptyFields())
watch(
  registro,
  (value) => {
    if (value) {
      fields.value = fieldsFromRegistro(value)
    }
  },
  { immediate: true },
)

function buildRequest(common: {
  justificativa: string
  contatoEmail: string
  turnstileToken: string
  website: string
}): SugestaoRequest | { error: string } {
  if (!registro.value) {
    return { error: 'Grupo não carregado. Recarregue a página.' }
  }

  const payload = diffPayload(fields.value, registro.value)
  if (Object.keys(payload).length === 0) {
    return { error: 'Nenhum campo foi alterado. Mude o que precisa corrigir antes de enviar.' }
  }

  return {
    tipo: 'UPDATE',
    alvoId: registro.value.id,
    payload,
    ...common,
  }
}
</script>

<style scoped>
.sugestao-intro {
  max-width: 560px;
  margin-bottom: var(--space-5);
}

.sugestao-notfound {
  display: grid;
  gap: var(--space-3);
  justify-items: start;
}

.sugestao-remocao {
  max-width: 560px;
  margin-top: var(--space-6);
  color: var(--color-asphalt-55);
}
</style>
