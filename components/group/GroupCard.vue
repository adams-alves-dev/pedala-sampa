<template>
  <article>
    <button
      class="group-card"
      :class="{ 'group-card--selected': isSelected }"
      type="button"
      :aria-pressed="isSelected"
      @click="$emit('select', group.slug)"
    >
      <span v-if="isSelected" class="selected-label">Selecionado</span>
      <strong class="group-card__name">{{ group.name }}</strong>
      <span class="group-card__location">{{ group.region || group.departureAddress || 'Ponto de saída no mapa' }}</span>
      <GroupMetaBadges v-if="primarySchedule" :schedule="primarySchedule" />
    </button>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Group } from '../../types/group'
import GroupMetaBadges from './GroupMetaBadges.vue'

const props = defineProps<{
  group: Group
  isSelected?: boolean
}>()

defineEmits<{
  select: [slug: string]
}>()

const primarySchedule = computed(() => props.group.schedules[0])
</script>

<style scoped>
.group-card {
  width: 100%;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-paper);
  color: var(--color-asphalt);
  cursor: pointer;
  display: grid;
  gap: 10px;
  padding: 14px;
  text-align: left;
}

.group-card:hover,
.group-card--selected {
  border-color: var(--color-bike-green);
  box-shadow: 0 0 0 4px rgb(22 160 93 / 14%);
}

.selected-label {
  color: var(--color-bike-green);
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
}

.group-card__name {
  font-size: 1.05rem;
}

.group-card__location {
  color: rgb(21 21 21 / 72%);
}
</style>
