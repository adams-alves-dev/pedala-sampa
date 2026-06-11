<template>
  <p v-if="pending" class="ps-body" role="status">Carregando dados do grupo…</p>

  <div v-else-if="!record" class="suggestion-notfound">
    <p class="ps-body">Não encontramos esse grupo. Ele pode já ter sido removido.</p>
    <NuxtLink class="ps-btn" to="/">Voltar ao mapa</NuxtLink>
  </div>

  <div v-else>
    <div class="suggestion-summary">
      <p class="ps-label">Grupo</p>
      <p class="ps-data">{{ record.name }}</p>
      <p v-if="record.address" class="ps-body">{{ record.address }}</p>
      <p v-if="record.day || record.startHour" class="ps-body">
        {{ [record.day, record.startHour].filter(Boolean).join(' · ') }}
      </p>
    </div>

    <p class="ps-body suggestion-intro">
      O pedido de remoção passa por revisão antes de qualquer mudança. Se você é quem organiza o
      pedal e não quer o grupo exposto no site, conte isso na justificativa — esse pedido tem
      prioridade.
    </p>

    <SuggestionFormBase
      submit-label="Solicitar remoção"
      justification-label="Motivo da remoção"
      justification-hint="Ex.: o grupo encerrou as atividades, ou sou o organizador e não quero o grupo no site."
      :build-request="buildRequest"
    />
  </div>
</template>

<script setup lang="ts">
import type { SuggestionRequest } from '../../types/suggestion'
import SuggestionFormBase from './SuggestionFormBase.vue'

const props = defineProps<{
  slug: string
}>()

const { fetchGroupRecord } = useSuggestions()

const { data: record, pending } = useAsyncData(
  `record:${props.slug}`,
  () => fetchGroupRecord(props.slug).catch(() => null),
  { server: false, default: () => null },
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

  return {
    type: 'DELETE',
    targetId: record.value.id,
    ...common,
  }
}
</script>

<style scoped>
.suggestion-summary {
  display: grid;
  gap: var(--space-1);
  max-width: 560px;
  margin-bottom: var(--space-5);
  padding: var(--space-4);
  border: 2px solid var(--color-border);
}

.suggestion-summary p {
  margin: 0;
}

.suggestion-intro {
  max-width: 560px;
  margin-bottom: var(--space-5);
}

.suggestion-notfound {
  display: grid;
  gap: var(--space-3);
  justify-items: start;
}
</style>
