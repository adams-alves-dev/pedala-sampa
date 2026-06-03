<template>
  <div class="ps-badges" aria-label="Resumo do grupo">
    <div v-for="badge in badges" :key="badge.key" class="ps-badge">
      <span class="ps-badge__ic"><PsIcon :name="BADGE_ICON[badge.key]" :size="15" /></span>
      <div>
        <div class="ps-badge__k">{{ BADGE_LABEL[badge.key] }}</div>
        <div class="ps-badge__v">{{ badge.value }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BADGE_ICON, BADGE_LABEL, type BadgeKey } from '../../lib/icons'
import type { GroupSchedule } from '../../types/group'

const props = defineProps<{
  schedule: GroupSchedule
}>()

const badges = computed<Array<{ key: BadgeKey; value: string }>>(() => [
  { key: 'day', value: props.schedule.day },
  { key: 'departure', value: props.schedule.startHour },
  { key: 'level', value: props.schedule.effort },
  { key: 'distance', value: `${props.schedule.distanceKm} km` },
  { key: 'rhythm', value: `${props.schedule.rhythmKmH} km/h` },
])
</script>
