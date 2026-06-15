<template>
  <fieldset class="suggestion-fields">
    <legend class="ps-label suggestion-legend">Dados do grupo</legend>

    <div class="ps-field-group suggestion-span">
      <label class="ps-fieldlabel" :for="`${uid}-name`"
        >Nome do grupo {{ required ? '*' : '' }}</label
      >
      <input
        :id="`${uid}-name`"
        v-model="model.name"
        class="ps-input"
        type="text"
        maxlength="120"
        :required="required"
      />
    </div>

    <div class="ps-field-group suggestion-span">
      <label class="ps-fieldlabel" :for="`${uid}-link`"
        >Link de contato (Instagram, WhatsApp…)</label
      >
      <input
        :id="`${uid}-link`"
        v-model="model.linkUrl"
        class="ps-input"
        type="url"
        maxlength="500"
        placeholder="https://…"
      />
    </div>

    <div class="ps-field-group suggestion-span">
      <label class="ps-fieldlabel" :for="`${uid}-address`"
        >Endereço do ponto de saída</label
      >
      <input
        :id="`${uid}-address`"
        v-model="model.address"
        class="ps-input"
        type="text"
        maxlength="200"
      />
    </div>

    <div class="ps-field-group">
      <label class="ps-fieldlabel" :for="`${uid}-day`">Dia do pedal</label>
      <input
        :id="`${uid}-day`"
        v-model="model.day"
        class="ps-input"
        type="text"
        maxlength="40"
        placeholder="Ex.: Sábado"
      />
    </div>

    <div class="ps-field-group">
      <label class="ps-fieldlabel" :for="`${uid}-hour`">Horário de saída</label>
      <input
        :id="`${uid}-hour`"
        v-model="model.startHour"
        class="ps-input"
        type="time"
      />
    </div>

    <div class="ps-field-group">
      <label class="ps-fieldlabel" :for="`${uid}-effort`">Nível</label>
      <input
        :id="`${uid}-effort`"
        v-model="model.effort"
        class="ps-input"
        type="text"
        maxlength="40"
        placeholder="Ex.: Iniciante"
      />
    </div>

    <div class="ps-field-group">
      <label class="ps-fieldlabel" :for="`${uid}-distance`"
        >Distância (km)</label
      >
      <input
        :id="`${uid}-distance`"
        v-model="model.distanceKm"
        class="ps-input"
        type="number"
        min="1"
        max="600"
        step="any"
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

    <div class="ps-field-group suggestion-span">
      <label class="ps-fieldlabel" :for="`${uid}-duration`"
        >Duração aproximada (HH:MM)</label
      >
      <input
        :id="`${uid}-duration`"
        v-model="model.durationHhmm"
        class="ps-input suggestion-duration-input"
        type="time"
        :aria-describedby="`${uid}-duration-hint`"
      />
      <p
        :id="`${uid}-duration-hint`"
        class="suggestion-duration-hint"
        :class="`suggestion-duration-hint--${durationHintTone}`"
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

    <div class="ps-field-group suggestion-span">
      <span :id="`${uid}-point`" class="ps-fieldlabel">
        Ponto de saída no mapa {{ required ? '*' : '' }}
      </span>
      <div
        class="suggestion-map"
        role="application"
        :aria-labelledby="`${uid}-point`"
        :aria-describedby="`${uid}-coord-hint`"
      >
        <LocationPicker
          v-model:latitude="model.latitude"
          v-model:longitude="model.longitude"
        />
      </div>
      <p :id="`${uid}-coord-hint`" class="suggestion-hint" aria-live="polite">
        {{
          hasPoint
            ? `Ponto marcado em ${model.latitude}, ${model.longitude}. Clique no mapa ou arraste o pino para ajustar.`
            : 'Clique no ponto de saída do pedal no mapa para marcar.'
        }}
      </p>

      <details class="suggestion-coords">
        <summary class="suggestion-hint">
          Prefere digitar as coordenadas?
        </summary>
        <div class="suggestion-coords-grid">
          <div class="ps-field-group">
            <label class="ps-fieldlabel" :for="`${uid}-lat`"
              >Latitude {{ required ? '*' : '' }}</label
            >
            <input
              :id="`${uid}-lat`"
              v-model="model.latitude"
              class="ps-input"
              type="number"
              step="any"
              placeholder="-23.55"
              :required="required"
            />
          </div>
          <div class="ps-field-group">
            <label class="ps-fieldlabel" :for="`${uid}-lng`"
              >Longitude {{ required ? '*' : '' }}</label
            >
            <input
              :id="`${uid}-lng`"
              v-model="model.longitude"
              class="ps-input"
              type="number"
              step="any"
              placeholder="-46.63"
              :required="required"
            />
          </div>
        </div>
      </details>
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'
import { parseDurationToMinutes, parseNumber } from '../../lib/suggestion-form'
import type { SuggestionFormFields } from '../../lib/suggestion-form'
import { getRhythmFromDistanceAndDuration } from '../../lib/time'
import LocationPicker from './LocationPicker.client.vue'

withDefaults(
  defineProps<{
    /** Marca nome/latitude/longitude como obrigatórios (fluxo de grupo novo). */
    required?: boolean
  }>(),
  { required: false },
)

const model = defineModel<SuggestionFormFields>({ required: true })
const uid = useId()

const hasPoint = computed(
  () =>
    parseNumber(model.value.latitude) !== undefined &&
    parseNumber(model.value.longitude) !== undefined,
)

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
.suggestion-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
  margin: 0;
  padding: 0;
  border: 0;
}

.suggestion-legend {
  margin-bottom: var(--space-2);
  padding: 0;
}

.suggestion-span {
  grid-column: 1 / -1;
}

.suggestion-hint {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--color-asphalt-55);
}

.suggestion-duration-input {
  max-width: 12rem;
}

/* helper da duração: mais presente que os hints comuns, para a pessoa perceber
   que pode preencher o ritmo pela duração */
.suggestion-duration-hint {
  margin: var(--space-1) 0 0;
  font-size: var(--text-base);
}

.suggestion-duration-hint--accent {
  color: var(--color-green-dark);
  font-weight: 600;
}

.suggestion-duration-hint--warn {
  color: var(--color-alert-red);
  font-weight: 600;
}

.suggestion-duration-hint--muted {
  font-size: var(--text-sm);
  color: var(--color-asphalt-55);
}

.suggestion-map {
  height: 280px;
  border: 2px solid var(--color-border);
  background: var(--color-concrete);
  overflow: hidden;
}

.suggestion-coords > summary {
  cursor: pointer;
  width: fit-content;
  transition: color var(--duration-fast) var(--ease-out);
}

.suggestion-coords > summary:hover {
  color: var(--color-asphalt);
}

.suggestion-coords-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
  margin-top: var(--space-3);
}

@media (max-width: 560px) {
  .suggestion-coords-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .suggestion-fields {
    grid-template-columns: 1fr;
  }
}
</style>
