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
      Não encontramos esse grupo. Ele pode ter sido removido.
    </p>
    <NuxtLink class="ps-btn" to="/">Voltar ao mapa</NuxtLink>
  </div>

  <div v-else>
    <p class="ps-body suggestion-intro">
      Os campos abaixo mostram o que está publicado para
      <strong>{{ record.name }}</strong
      >. Altere só o que precisa corrigir — enviamos para revisão apenas o que
      mudou.
    </p>

    <fieldset v-if="record.schedules.length > 1" class="schedule-picker">
      <legend class="ps-label schedule-picker__legend">
        Qual agenda corrigir?
      </legend>
      <p class="schedule-picker__hint">
        Este grupo tem {{ record.schedules.length }} agendas — escolha qual você
        quer corrigir.
      </p>
      <div class="schedule-picker__opts">
        <label
          v-for="(sched, index) in record.schedules"
          :key="sched.id"
          class="schedule-picker__opt"
          :class="{ 'is-active': sched.id === selectedScheduleId }"
        >
          <input
            class="schedule-picker__radio"
            type="radio"
            name="schedule-pick"
            :value="sched.id"
            :checked="sched.id === selectedScheduleId"
            @change="selectedScheduleId = sched.id"
          />
          <span>{{ scheduleLabel(sched, index) }}</span>
        </label>
      </div>
    </fieldset>

    <SuggestionFormBase
      submit-label="Enviar correção"
      justification-hint="Conte de onde veio a informação corrigida (ex.: sou do grupo, o ponto mudou)."
      :build-request="buildRequest"
    >
      <SuggestionGroupFields v-model="fields" />
    </SuggestionFormBase>

    <p class="ps-body suggestion-removal">
      O grupo não existe mais ou não quer aparecer no site?
      <NuxtLink :to="`/contribute/removal/${record.slug}`"
        >Solicitar remoção</NuxtLink
      >
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  diffPayload,
  emptyFields,
  fieldsFromRecord,
  scheduleLabel,
} from '../../lib/suggestion-form'
import type {
  SuggestionGroupPayload,
  SuggestionRequest,
} from '../../types/suggestion'
import SuggestionFormBase from './SuggestionFormBase.vue'
import SuggestionGroupFields from './SuggestionGroupFields.vue'

const props = defineProps<{
  slug: string
}>()

const { fetchGroupRecord } = useSuggestions()

// busca só no client: a página é prerenderizada como casca estática
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

const fields = ref(emptyFields())
const selectedScheduleId = ref<string>()

const chosenSchedule = computed(() =>
  record.value?.schedules.find((s) => s.id === selectedScheduleId.value),
)

// na carga do grupo: seleciona a 1ª agenda e pré-preenche
watch(
  record,
  (value) => {
    selectedScheduleId.value = value?.schedules[0]?.id
    fields.value = value
      ? fieldsFromRecord(value, value.schedules[0])
      : emptyFields()
  },
  { immediate: true },
)

// trocar de agenda repreenche os campos com os valores publicados dela
watch(selectedScheduleId, () => {
  if (record.value) {
    fields.value = fieldsFromRecord(record.value, chosenSchedule.value)
  }
})

function hasScheduleChange(payload: SuggestionGroupPayload): boolean {
  return (
    payload.day !== undefined ||
    payload.startHour !== undefined ||
    payload.effort !== undefined ||
    payload.distanceKm !== undefined ||
    payload.rhythmKmH !== undefined
  )
}

function buildRequest(common: {
  justification: string
  contactEmail: string
  turnstileToken: string
  website: string
}): SuggestionRequest | { error: string } {
  if (!record.value) {
    return { error: 'Grupo não carregado. Recarregue a página.' }
  }

  const payload = diffPayload(fields.value, record.value, chosenSchedule.value)
  if (Object.keys(payload).length === 0) {
    return {
      error:
        'Nenhum campo foi alterado. Mude o que precisa corrigir antes de enviar.',
    }
  }

  // marca a agenda alvo só quando um campo de agenda mudou
  if (chosenSchedule.value && hasScheduleChange(payload)) {
    payload.scheduleId = chosenSchedule.value.id
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

.schedule-picker {
  max-width: 560px;
  margin: 0 0 var(--space-5);
  padding: var(--space-4);
  border: 2px solid var(--color-border);
}

.schedule-picker__legend {
  padding: 0 var(--space-2);
}

.schedule-picker__hint {
  margin: 0 0 var(--space-3);
  font-size: var(--text-xs);
  color: var(--color-asphalt-55);
}

.schedule-picker__opts {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.schedule-picker__opt {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 2px solid var(--color-border);
  cursor: pointer;
  font-size: var(--text-sm);
  font-weight: 600;
  transition: border-color var(--duration-fast) var(--ease-out);
}

.schedule-picker__opt:hover {
  border-color: var(--color-asphalt);
}

.schedule-picker__opt.is-active {
  border-color: var(--color-bike-green);
  background: var(--color-green-tint);
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

.suggestion-removal a {
  transition: color var(--duration-fast) var(--ease-out);
}

.suggestion-removal a:hover {
  color: var(--color-asphalt);
}
</style>
