<template>
  <p v-if="pending" class="ps-body" role="status">Carregando dados do grupo…</p>

  <div v-else-if="loadFailed" class="suggestion-notfound">
    <p class="ps-body">
      Não foi possível carregar o grupo agora. Tente novamente em instantes.
    </p>
    <button class="ps-btn" type="button" @click="refresh()">
      Tentar de novo
    </button>
  </div>

  <div v-else-if="!record" class="suggestion-notfound">
    <p class="ps-body">
      Não encontramos esse grupo. Ele pode já ter sido removido.
    </p>
    <NuxtLink class="ps-btn" to="/">Voltar ao mapa</NuxtLink>
  </div>

  <div v-else>
    <div class="suggestion-summary">
      <p class="ps-label">Grupo</p>
      <p class="ps-data">{{ record.name }}</p>
      <p v-if="record.address" class="ps-body">{{ record.address }}</p>
      <ul v-if="record.schedules.length" class="suggestion-summary__agendas">
        <li v-for="(sched, index) in record.schedules" :key="sched.id">
          {{ scheduleLabel(sched, index) }}
        </li>
      </ul>
    </div>

    <fieldset v-if="record.schedules.length > 1" class="removal-scope">
      <legend class="ps-label removal-scope__legend">O que remover?</legend>
      <label
        class="removal-scope__opt"
        :class="{ 'is-active': selectedTarget === 'group' }"
      >
        <input
          type="radio"
          name="removal-scope"
          value="group"
          :checked="selectedTarget === 'group'"
          @change="selectedTarget = 'group'"
        />
        <span>O grupo inteiro (todas as agendas)</span>
      </label>
      <label
        v-for="(sched, index) in record.schedules"
        :key="sched.id"
        class="removal-scope__opt"
        :class="{ 'is-active': selectedTarget === sched.id }"
      >
        <input
          type="radio"
          name="removal-scope"
          :value="sched.id"
          :checked="selectedTarget === sched.id"
          @change="selectedTarget = sched.id"
        />
        <span>Só a agenda: {{ scheduleLabel(sched, index) }}</span>
      </label>
    </fieldset>

    <p class="ps-body suggestion-intro">
      O pedido passa por revisão antes de qualquer mudança. Se você é quem
      organiza o pedal e não quer o grupo exposto no site, conte isso na
      justificativa — esse pedido tem prioridade.
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
import { computed, ref, watch } from 'vue'
import { scheduleLabel } from '../../lib/suggestion-form'
import type { SuggestionRequest } from '../../types/suggestion'
import SuggestionFormBase from './SuggestionFormBase.vue'

const props = defineProps<{
  slug: string
}>()

const { fetchGroupRecord } = useSuggestions()

const {
  data: record,
  pending,
  error,
  refresh,
} = useAsyncData(`record:${props.slug}`, () => fetchGroupRecord(props.slug), {
  server: false,
  default: () => null,
})

// 404 cai no estado "não encontramos"; qualquer outra falha pede nova tentativa
const loadFailed = computed(
  () => Boolean(error.value) && error.value?.statusCode !== 404,
)

// "group" = remover o grupo inteiro; um id = remover só aquela agenda
const selectedTarget = ref('group')
watch(record, () => {
  selectedTarget.value = 'group'
})

function buildRequest(common: {
  justification: string
  contactEmail: string
  turnstileToken: string
  website: string
}): SuggestionRequest | { error: string } {
  if (!record.value) {
    return { error: 'Grupo não carregado. Recarregue a página.' }
  }

  const payload =
    selectedTarget.value !== 'group'
      ? { scheduleId: selectedTarget.value }
      : undefined

  return {
    type: 'DELETE',
    targetId: record.value.id,
    payload,
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

.suggestion-summary__agendas {
  margin: var(--space-1) 0 0;
  padding-left: var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-asphalt-55);
}

.removal-scope {
  display: grid;
  gap: var(--space-2);
  max-width: 560px;
  margin: 0 0 var(--space-5);
  padding: var(--space-4);
  border: 2px solid var(--color-border);
}

.removal-scope__legend {
  padding: 0 var(--space-2);
}

.removal-scope__opt {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 2px solid var(--color-border);
  cursor: pointer;
  font-size: var(--text-sm);
  transition: border-color var(--duration-fast) var(--ease-out);
}

.removal-scope__opt:hover {
  border-color: var(--color-asphalt);
}

.removal-scope__opt.is-active {
  border-color: var(--color-alert-red);
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
