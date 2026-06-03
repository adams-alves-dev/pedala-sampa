<template>
  <button
    class="ps-card"
    :class="{ 'ps-card--selected': isSelected }"
    type="button"
    :aria-pressed="isSelected"
    @click="$emit('select', group.slug)"
  >
    <span class="ps-card__rail" />
    <span class="ps-card__body">
      <span v-if="isSelected" class="ps-card__tag"><PsIcon name="check" :size="14" /> Selecionado</span>
      <span class="ps-card__name">{{ group.name }}</span>
      <span class="ps-card__loc">
        <PsIcon name="pin" :size="14" />
        {{ group.region || group.departureAddress || 'Ponto de saída no mapa' }}
      </span>
      <GroupMetaBadges v-if="primarySchedule" :schedule="primarySchedule" />
    </span>
  </button>
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
/* icon + text alignment for the design-system card classes */
.ps-card__tag,
.ps-card__loc {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
</style>
