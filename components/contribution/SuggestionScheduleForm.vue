<template>
  <SuggestionFormBase
    submit-label="Enviar agenda"
    justification-label="Sobre a agenda"
    justification-hint="Conte como conhece o grupo e de onde vêm o dia e o horário."
    :build-request="buildRequest"
  >
    <GroupCombobox v-model="selection" :groups="groups" :pending="pending" />

    <template v-if="selection?.kind === 'existing'">
      <ScheduleFields v-model="fields" required />
    </template>

    <template v-else-if="selection?.kind === 'new'">
      <p class="schedule-newnote ps-body">
        Grupo novo — preencha também o ponto de saída e o contato. Tudo passa
        por revisão antes de ir ao ar.
      </p>
      <SuggestionGroupFields v-model="fields" required />
    </template>
  </SuggestionFormBase>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { GroupSelection } from '../../lib/contribution'
import {
  emptyFields,
  hasCompleteSchedule,
  payloadFromFields,
} from '../../lib/suggestion-form'
import type { SuggestionFormFields } from '../../lib/suggestion-form'
import type { Group } from '../../types/group'
import type { SuggestionRequest } from '../../types/suggestion'
import GroupCombobox from './GroupCombobox.vue'
import ScheduleFields from './ScheduleFields.vue'
import SuggestionFormBase from './SuggestionFormBase.vue'
import SuggestionGroupFields from './SuggestionGroupFields.vue'

const props = withDefaults(
  defineProps<{
    groups: Group[]
    pending?: boolean
    /** Slug vindo de `?group=` para pré-selecionar o grupo (deep-link). */
    preselectSlug?: string
  }>(),
  { pending: false, preselectSlug: undefined },
)

const selection = ref<GroupSelection | null>(null)
const fields = ref<SuggestionFormFields>(emptyFields())

// pré-seleção via ?group=slug, assim que a lista de grupos carrega
watch(
  () => [props.groups, props.preselectSlug] as const,
  ([groups, slug]) => {
    if (!slug || selection.value) {
      return
    }
    const match = groups.find((group) => group.slug === slug)
    if (match) {
      selection.value = { kind: 'existing', group: match }
    }
  },
  { immediate: true },
)

// ao escolher "criar grupo novo", leva o nome digitado para o campo do grupo
watch(selection, (sel) => {
  if (sel?.kind === 'new' && !fields.value.name.trim()) {
    fields.value.name = sel.name
  }
})

type CommonFields = {
  justification: string
  contactEmail: string
  turnstileToken: string
  website: string
}

function buildRequest(
  common: CommonFields,
): SuggestionRequest | { error: string } {
  const sel = selection.value
  if (!sel) {
    return { error: 'Escolha um grupo da lista ou crie um novo.' }
  }

  if (sel.kind === 'existing') {
    // só os campos de agenda — o grupo (nome/ponto/contato) já existe
    const scheduleOnly: SuggestionFormFields = {
      ...emptyFields(),
      day: fields.value.day,
      startHour: fields.value.startHour,
      effort: fields.value.effort,
      distanceKm: fields.value.distanceKm,
      rhythmKmH: fields.value.rhythmKmH,
      durationHhmm: fields.value.durationHhmm,
    }
    const payload = payloadFromFields(scheduleOnly)
    if (!hasCompleteSchedule(payload)) {
      return {
        error:
          'Preencha a agenda: dia, horário, nível, distância e o ritmo (ou a duração).',
      }
    }
    return { type: 'CREATE', targetId: sel.group.id, payload, ...common }
  }

  // grupo novo: mesmo contrato do fluxo de criar grupo (grupo + agenda opcional)
  const payload = payloadFromFields(fields.value)
  if (
    !payload.name ||
    payload.latitude === undefined ||
    payload.longitude === undefined
  ) {
    return {
      error:
        'Preencha pelo menos o nome do grupo e as coordenadas do ponto de saída.',
    }
  }
  return { type: 'CREATE', payload, ...common }
}
</script>

<style scoped>
.schedule-newnote {
  margin: 0;
  padding: var(--space-3);
  border-left: 4px solid var(--color-sign-yellow);
  background: var(--color-paper-2);
  font-size: var(--text-sm);
}
</style>
