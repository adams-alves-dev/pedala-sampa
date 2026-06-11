<template>
  <p v-if="pending" class="ps-body" role="status">Carregando dados do grupo…</p>

  <div v-else-if="!record" class="suggestion-notfound">
    <p class="ps-body">Não encontramos esse grupo. Ele pode ter sido removido.</p>
    <NuxtLink class="ps-btn" to="/">Voltar ao mapa</NuxtLink>
  </div>

  <div v-else>
    <p class="ps-body suggestion-intro">
      Os campos abaixo mostram o que está publicado para
      <strong>{{ record.name }}</strong>. Altere só o que precisa corrigir — enviamos para
      revisão apenas o que mudou.
    </p>

    <SuggestionFormBase
      submit-label="Enviar correção"
      justification-hint="Conte de onde veio a informação corrigida (ex.: sou do grupo, o ponto mudou)."
      :build-request="buildRequest"
    >
      <SuggestionGroupFields v-model="fields" />
    </SuggestionFormBase>

    <p class="ps-body suggestion-removal">
      O grupo não existe mais ou não quer aparecer no site?
      <NuxtLink :to="`/contribute/removal/${record.slug}`">Solicitar remoção</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { diffPayload, emptyFields, fieldsFromRecord } from '../../lib/suggestion-form'
import type { SuggestionRequest } from '../../types/suggestion'
import SuggestionFormBase from './SuggestionFormBase.vue'
import SuggestionGroupFields from './SuggestionGroupFields.vue'

const props = defineProps<{
  slug: string
}>()

const { fetchGroupRecord } = useSuggestions()

// busca só no client: a página é prerenderizada como casca estática
const { data: record, pending } = useAsyncData(
  `record:${props.slug}`,
  () => fetchGroupRecord(props.slug).catch(() => null),
  { server: false, default: () => null },
)

const fields = ref(emptyFields())
watch(
  record,
  (value) => {
    if (value) {
      fields.value = fieldsFromRecord(value)
    }
  },
  { immediate: true },
)

function buildRequest(common: {
  justification: string
  contactEmail: string
  turnstileToken: string
  website: string
}): SuggestionRequest | { error: string } {
  if (!record.value) {
    return { error: 'Grupo não carregado. Recarregue a página.' }
  }

  const payload = diffPayload(fields.value, record.value)
  if (Object.keys(payload).length === 0) {
    return { error: 'Nenhum campo foi alterado. Mude o que precisa corrigir antes de enviar.' }
  }

  return {
    type: 'UPDATE',
    targetId: record.value.id,
    payload,
    ...common,
  }
}
</script>

<style scoped>
.suggestion-intro {
  max-width: 560px;
  margin-bottom: var(--space-5);
}

.suggestion-notfound {
  display: grid;
  gap: var(--space-3);
  justify-items: start;
}

.suggestion-removal {
  max-width: 560px;
  margin-top: var(--space-6);
  color: var(--color-asphalt-55);
}
</style>
