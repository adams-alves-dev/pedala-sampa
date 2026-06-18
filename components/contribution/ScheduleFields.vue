<template>
  <fieldset class="schedule-fields">
    <legend class="ps-label schedule-legend">{{ legend }}</legend>

    <div class="ps-field-group">
      <label class="ps-fieldlabel" :for="`${uid}-day`"
        >Dia do pedal {{ required ? '*' : '' }}</label
      >
      <input
        :id="`${uid}-day`"
        v-model="model.day"
        class="ps-input"
        type="text"
        maxlength="40"
        placeholder="Ex.: Sábado"
        :required="required"
      />
    </div>

    <div class="ps-field-group">
      <label class="ps-fieldlabel" :for="`${uid}-hour`"
        >Horário de saída {{ required ? '*' : '' }}</label
      >
      <input
        :id="`${uid}-hour`"
        v-model="model.startHour"
        class="ps-input"
        type="time"
        :required="required"
      />
    </div>

    <div class="ps-field-group">
      <label class="ps-fieldlabel" :for="`${uid}-effort`"
        >Nível {{ required ? '*' : '' }}</label
      >
      <input
        :id="`${uid}-effort`"
        v-model="model.effort"
        class="ps-input"
        type="text"
        maxlength="40"
        placeholder="Ex.: Iniciante"
        :required="required"
      />
    </div>

    <div class="ps-field-group">
      <label class="ps-fieldlabel" :for="`${uid}-distance`"
        >Distância (km) {{ required ? '*' : '' }}</label
      >
      <input
        :id="`${uid}-distance`"
        v-model="model.distanceKm"
        class="ps-input"
        type="number"
        min="1"
        max="600"
        step="any"
        :required="required"
      />
    </div>

    <div class="ps-field-group">
      <label class="ps-fieldlabel" :for="`${uid}-rhythm`"
        >Ritmo médio (km/h)</label
      >
      <input
        :id="`${uid}-rhythm`"
        v-model="model.rhythmKmH"
        class="ps-input"
        type="number"
        min="1"
        max="60"
        step="any"
      />
    </div>

    <div class="ps-field-group schedule-span">
      <label class="ps-fieldlabel" :for="`${uid}-duration`"
        >Duração aproximada (HH:MM)</label
      >
      <input
        :id="`${uid}-duration`"
        v-model="model.durationHhmm"
        class="ps-input schedule-duration-input"
        type="time"
        :aria-describedby="`${uid}-duration-hint`"
      />
      <p
        :id="`${uid}-duration-hint`"
        class="schedule-duration-hint"
        :class="`schedule-duration-hint--${durationHintTone}`"
        aria-live="polite"
      >
        <template v-if="rhythmTyped">Usando o ritmo informado acima.</template>
        <template v-else-if="derivedRhythm === null">
          Não sabe o ritmo? Informe a duração e calculamos pela distância.
        </template>
        <template v-else-if="rhythmTooHigh">
          Ritmo calculado (≈ {{ formatRhythm(derivedRhythm) }} km/h) parece alto
          demais — confira a distância e a duração.
        </template>
        <template v-else>
          Ritmo calculado: ≈ {{ formatRhythm(derivedRhythm) }} km/h.
        </template>
      </p>
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'
import { parseDurationToMinutes, parseNumber } from '../../lib/suggestion-form'
import type { SuggestionFormFields } from '../../lib/suggestion-form'
import { getRhythmFromDistanceAndDuration } from '../../lib/time'

withDefaults(
  defineProps<{
    /** Marca dia/horário/nível/distância como obrigatórios (fluxo "adicionar agenda"). */
    required?: boolean
    legend?: string
  }>(),
  { required: false, legend: 'Agenda' },
)

const model = defineModel<SuggestionFormFields>({ required: true })
const uid = useId()

// o ritmo digitado tem precedência sobre a duração
const rhythmTyped = computed(
  () => parseNumber(model.value.rhythmKmH) !== undefined,
)

/** Ritmo derivado da distância + duração — só quando o ritmo não foi digitado. */
const derivedRhythm = computed<number | null>(() => {
  if (rhythmTyped.value) {
    return null
  }
  const distanceKm = parseNumber(model.value.distanceKm)
  const durationMinutes = parseDurationToMinutes(model.value.durationHhmm)
  if (distanceKm === undefined || durationMinutes === null) {
    return null
  }
  return getRhythmFromDistanceAndDuration({ distanceKm, durationMinutes })
})

// avisamos antes de enviar; este limite precisa acompanhar o `.max(60)` do
// `rhythmKmH` em payloadSchema (lib/suggestion-schemas.ts), que é o backstop real
const rhythmTooHigh = computed(
  () => derivedRhythm.value !== null && derivedRhythm.value > 60,
)

// destaque (verde) no convite e no resultado; vermelho no aviso; discreto quando
// o ritmo já foi digitado e a duração é ignorada
const durationHintTone = computed(() => {
  if (rhythmTooHigh.value) {
    return 'warn'
  }
  if (rhythmTyped.value) {
    return 'muted'
  }
  return 'accent'
})

function formatRhythm(value: number | null): string {
  return value === null ? '' : String(value).replace('.', ',')
}
</script>

<style scoped>
.schedule-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
  margin: 0;
  padding: 0;
  border: 0;
}

.schedule-legend {
  margin-bottom: var(--space-2);
  padding: 0;
}

.schedule-span {
  grid-column: 1 / -1;
}

.schedule-duration-input {
  max-width: 12rem;
}

/* helper da duração: mais presente que os hints comuns, para a pessoa perceber
   que pode preencher o ritmo pela duração */
.schedule-duration-hint {
  margin: var(--space-1) 0 0;
  font-size: var(--text-base);
}

.schedule-duration-hint--accent {
  color: var(--color-green-dark);
  font-weight: 600;
}

.schedule-duration-hint--warn {
  color: var(--color-alert-red);
  font-weight: 600;
}

.schedule-duration-hint--muted {
  font-size: var(--text-sm);
  color: var(--color-asphalt-55);
}

@media (max-width: 560px) {
  .schedule-fields {
    grid-template-columns: 1fr;
  }
}
</style>
