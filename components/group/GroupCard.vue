<template>
  <article>
    <button
      class="group-card"
      :class="{ 'group-card--selected': isSelected }"
      type="button"
      :aria-pressed="isSelected"
      @click="$emit('select', group.slug)"
    >
      <span class="group-card__accent" />
      <div class="group-card__body">
        <span v-if="isSelected" class="selected-label">Selecionado</span>
        <strong class="group-card__name">{{ group.name }}</strong>
        <span class="group-card__location">{{ group.region || group.departureAddress || 'Ponto de saída no mapa' }}</span>
        <GroupMetaBadges v-if="primarySchedule" :schedule="primarySchedule" />
      </div>
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
  display: grid;
  grid-template-columns: 4px 1fr;
  border: 2px solid var(--color-border);
  background: var(--color-paper);
  color: var(--color-asphalt);
  cursor: pointer;
  padding: 0;
  text-align: left;
  transition: border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out);
  overflow: hidden;
}

.group-card:hover {
  border-color: var(--color-forest);
}

.group-card--selected {
  border-color: var(--color-forest);
  box-shadow: 0 0 0 3px rgb(0 121 107 / 15%);
}

.group-card__accent {
  width: 4px;
  background: var(--color-border);
  transition: background var(--duration-fast) var(--ease-out);
}

.group-card:hover .group-card__accent {
  background: var(--color-forest);
}

.group-card--selected .group-card__accent {
  background: var(--color-forest);
}

.group-card__body {
  padding: var(--space-4);
  display: grid;
  gap: var(--space-1);
}

.selected-label {
  color: var(--color-forest);
  font-size: var(--text-xs);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.group-card__name {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.group-card__location {
  font-size: var(--text-sm);
  color: rgb(26 18 11 / 55%);
  margin-bottom: var(--space-1);
}
</style>
