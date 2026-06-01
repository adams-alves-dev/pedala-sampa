<template>
  <article class="details">
    <h1>{{ group.name }}</h1>
    <p>{{ group.region || group.departureAddress || 'Ponto de saída no mapa' }}</p>
    <GroupMetaBadges v-if="primarySchedule" :schedule="primarySchedule" />
    <p v-if="primarySchedule">Tempo médio: {{ duration }}</p>
    <div class="actions">
      <a v-if="group.link?.url" :href="group.link.url" target="_blank" rel="noopener noreferrer">Acessar grupo</a>
      <ContributionLink :href="contributionFormUrl" context="correction" />
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getEstimatedLapDuration } from '../../lib/time'
import type { Group } from '../../types/group'
import ContributionLink from '../contribution/ContributionLink.vue'
import GroupMetaBadges from './GroupMetaBadges.vue'

const props = defineProps<{
  group: Group
  contributionFormUrl?: string
}>()

const primarySchedule = computed(() => props.group.schedules[0])
const duration = computed(() =>
  primarySchedule.value
    ? getEstimatedLapDuration({
        distanceKm: primarySchedule.value.distanceKm,
        rhythmKmH: primarySchedule.value.rhythmKmH,
      })
    : '',
)
</script>

<style scoped>
.details {
  background: var(--color-paper);
  border: 2px solid var(--color-asphalt);
  border-radius: var(--radius-md);
  display: grid;
  gap: 16px;
  padding: 24px;
}

h1 {
  font-size: clamp(2rem, 8vw, 4.5rem);
  line-height: 0.95;
  margin: 0;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
