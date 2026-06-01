<template>
  <section v-if="group" class="quick-view" aria-label="Detalhe rápido do grupo">
    <button type="button" class="close" @click="$emit('close')">Fechar</button>
    <h2>{{ group.name }}</h2>
    <p>{{ group.region || group.departureAddress || 'Ponto de saída no mapa' }}</p>
    <GroupMetaBadges v-if="primarySchedule" :schedule="primarySchedule" />
    <p v-if="primarySchedule">Tempo médio: {{ duration }}</p>
    <div class="actions">
      <NuxtLink :to="`/grupo/${group.slug}`">Abrir página completa</NuxtLink>
      <ContributionLink :href="contributionFormUrl" context="correction" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getEstimatedLapDuration } from '../../lib/time'
import type { Group } from '../../types/group'
import ContributionLink from '../contribution/ContributionLink.vue'
import GroupMetaBadges from '../group/GroupMetaBadges.vue'

const props = defineProps<{
  group: Group | null
  contributionFormUrl?: string
}>()

defineEmits<{
  close: []
}>()

const primarySchedule = computed(() => props.group?.schedules[0])
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
.quick-view {
  background: var(--color-paper);
  border: 2px solid var(--color-asphalt);
  border-radius: var(--radius-md);
  display: grid;
  gap: 12px;
  padding: 16px;
}

.close {
  justify-self: end;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
