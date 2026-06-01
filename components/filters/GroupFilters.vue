<template>
  <form class="filters" @submit.prevent>
    <label>
      <span>Buscar</span>
      <input v-model="localFilters.query" type="search" placeholder="Nome, bairro, dia ou nível" @input="emitChange" />
    </label>

    <label>
      <span>Dia</span>
      <select v-model="selectedDay" @change="syncDay">
        <option value="">Todos</option>
        <option v-for="day in days" :key="day" :value="day">{{ day }}</option>
      </select>
    </label>

    <label>
      <span>Nível</span>
      <select v-model="selectedEffort" @change="syncEffort">
        <option value="">Todos</option>
        <option v-for="effort in efforts" :key="effort" :value="effort">{{ effort }}</option>
      </select>
    </label>

    <label>
      <span>Distância</span>
      <select v-model="localFilters.distanceRange" @change="emitChange">
        <option :value="undefined">Todas</option>
        <option value="up-to-20">Até 20 km</option>
        <option value="20-to-40">20 a 40 km</option>
        <option value="over-40">Acima de 40 km</option>
      </select>
    </label>

    <label>
      <span>Período</span>
      <select v-model="selectedPeriod" @change="syncPeriod">
        <option value="">Todos</option>
        <option value="morning">Manhã</option>
        <option value="afternoon">Tarde</option>
        <option value="night">Noite</option>
      </select>
    </label>

    <label>
      <span>Ritmo</span>
      <select v-model="selectedRhythm" @change="syncRhythm">
        <option value="">Todos</option>
        <option value="light">Leve</option>
        <option value="moderate">Moderado</option>
        <option value="strong">Forte</option>
      </select>
    </label>

    <button type="button" class="clear" @click="$emit('clear')">Limpar filtros</button>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { GroupFilters, Period, Rhythm } from '../../types/group'

const props = defineProps<{
  modelValue: GroupFilters
  days: string[]
  efforts: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [filters: GroupFilters]
  clear: []
}>()

const localFilters = reactive<GroupFilters>({ ...props.modelValue })
const selectedDay = ref(props.modelValue.days[0] || '')
const selectedEffort = ref(props.modelValue.efforts[0] || '')
const selectedPeriod = ref<Period | ''>(props.modelValue.periods[0] || '')
const selectedRhythm = ref<Rhythm | ''>(props.modelValue.rhythms[0] || '')

watch(
  () => props.modelValue,
  (filters) => {
    Object.assign(localFilters, filters)
    selectedDay.value = filters.days[0] || ''
    selectedEffort.value = filters.efforts[0] || ''
    selectedPeriod.value = filters.periods[0] || ''
    selectedRhythm.value = filters.rhythms[0] || ''
  },
)

function emitChange() {
  emit('update:modelValue', { ...localFilters })
}

function syncDay() {
  localFilters.days = selectedDay.value ? [selectedDay.value] : []
  emitChange()
}

function syncEffort() {
  localFilters.efforts = selectedEffort.value ? [selectedEffort.value] : []
  emitChange()
}

function syncPeriod() {
  localFilters.periods = selectedPeriod.value ? [selectedPeriod.value] : []
  emitChange()
}

function syncRhythm() {
  localFilters.rhythms = selectedRhythm.value ? [selectedRhythm.value] : []
  emitChange()
}
</script>

<style scoped>
.filters {
  display: grid;
  gap: 10px;
}

label {
  display: grid;
  gap: 4px;
  font-weight: 800;
}

input,
select {
  min-height: 42px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-paper);
  padding: 0 10px;
}

.clear {
  min-height: 40px;
  border: 0;
  border-radius: var(--radius-sm);
  background: var(--color-asphalt);
  color: var(--color-paper);
  cursor: pointer;
  font-weight: 800;
}
</style>
