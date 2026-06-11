<template>
  <fieldset class="suggestion-fields">
    <legend class="ps-label suggestion-legend">Dados do grupo</legend>

    <div class="ps-field-group suggestion-span">
      <label class="ps-fieldlabel" :for="`${uid}-name`">Nome do grupo {{ required ? '*' : '' }}</label>
      <input
        :id="`${uid}-name`"
        v-model="model.name"
        class="ps-input"
        type="text"
        maxlength="120"
        :required="required"
      >
    </div>

    <div class="ps-field-group suggestion-span">
      <label class="ps-fieldlabel" :for="`${uid}-link`">Link de contato (Instagram, WhatsApp…)</label>
      <input
        :id="`${uid}-link`"
        v-model="model.linkUrl"
        class="ps-input"
        type="url"
        maxlength="500"
        placeholder="https://…"
      >
    </div>

    <div class="ps-field-group suggestion-span">
      <label class="ps-fieldlabel" :for="`${uid}-address`">Endereço do ponto de saída</label>
      <input
        :id="`${uid}-address`"
        v-model="model.address"
        class="ps-input"
        type="text"
        maxlength="200"
      >
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
      >
    </div>

    <div class="ps-field-group">
      <label class="ps-fieldlabel" :for="`${uid}-hour`">Horário de saída</label>
      <input
        :id="`${uid}-hour`"
        v-model="model.startHour"
        class="ps-input"
        type="time"
      >
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
      >
    </div>

    <div class="ps-field-group">
      <label class="ps-fieldlabel" :for="`${uid}-distance`">Distância (km)</label>
      <input
        :id="`${uid}-distance`"
        v-model="model.distanceKm"
        class="ps-input"
        type="number"
        min="1"
        max="600"
        step="any"
      >
    </div>

    <div class="ps-field-group">
      <label class="ps-fieldlabel" :for="`${uid}-rhythm`">Ritmo médio (km/h)</label>
      <input
        :id="`${uid}-rhythm`"
        v-model="model.rhythmKmH"
        class="ps-input"
        type="number"
        min="1"
        max="60"
        step="any"
      >
    </div>

    <div class="ps-field-group">
      <label class="ps-fieldlabel" :for="`${uid}-lat`">Latitude {{ required ? '*' : '' }}</label>
      <input
        :id="`${uid}-lat`"
        v-model="model.latitude"
        class="ps-input"
        type="number"
        step="any"
        placeholder="-23.55"
        :required="required"
        :aria-describedby="`${uid}-coord-hint`"
      >
    </div>

    <div class="ps-field-group">
      <label class="ps-fieldlabel" :for="`${uid}-lng`">Longitude {{ required ? '*' : '' }}</label>
      <input
        :id="`${uid}-lng`"
        v-model="model.longitude"
        class="ps-input"
        type="number"
        step="any"
        placeholder="-46.63"
        :required="required"
        :aria-describedby="`${uid}-coord-hint`"
      >
    </div>

    <p :id="`${uid}-coord-hint`" class="suggestion-hint suggestion-span">
      Para pegar as coordenadas, clique com o botão direito no ponto de saída no Google Maps e
      copie os números.
    </p>
  </fieldset>
</template>

<script setup lang="ts">
import { useId } from 'vue'
import type { SuggestionFormFields } from '../../lib/suggestion-form'

withDefaults(
  defineProps<{
    /** Marca nome/latitude/longitude como obrigatórios (fluxo de grupo novo). */
    required?: boolean
  }>(),
  { required: false },
)

const model = defineModel<SuggestionFormFields>({ required: true })
const uid = useId()
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

@media (max-width: 560px) {
  .suggestion-fields {
    grid-template-columns: 1fr;
  }
}
</style>
