<template>
  <Transition name="quickview">
    <section v-if="group" class="quick-view" aria-label="Detalhe rápido do grupo" aria-live="polite">
      <button type="button" class="close" @click="$emit('close')">Fechar</button>
      <div class="quick-view__sun" aria-hidden="true" />
      <h2>{{ group.name }}</h2>
      <p class="quick-view__location">{{ group.region || group.departureAddress || 'Ponto de saída no mapa' }}</p>
      <GroupMetaBadges v-if="primarySchedule" :schedule="primarySchedule" />
      <p v-if="primarySchedule" class="quick-view__duration">Tempo médio: {{ duration }}</p>
      <div class="actions">
        <NuxtLink :to="`/grupo/${group.slug}`" class="action-link">Página completa</NuxtLink>
        <ContributionLink :href="contributionFormUrl" context="correction" />
      </div>
    </section>
  </Transition>
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
.quickview-enter-active {
  transition: all var(--duration-normal) var(--ease-out);
}

.quickview-leave-active {
  transition: all var(--duration-fast) var(--ease-in-out);
}

.quickview-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.quickview-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.quick-view {
  background: var(--color-paper);
  border: 2px solid var(--color-asphalt);
  display: grid;
  gap: var(--space-3);
  padding: var(--space-5);
  position: relative;
  overflow: hidden;
}

.quick-view__sun {
  position: absolute;
  top: -24px;
  right: -24px;
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, rgb(255 179 0 / 10%) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.quick-view h2 {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.02em;
}

.quick-view__location {
  font-size: var(--text-sm);
  color: rgb(26 18 11 / 55%);
  margin: 0;
}

.quick-view__duration {
  font-size: var(--text-sm);
  font-weight: 600;
  margin: 0;
}

.close {
  justify-self: end;
  background: none;
  border: 2px solid var(--color-border);
  padding: var(--space-1) var(--space-3);
  font-weight: 800;
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: border-color var(--duration-fast) var(--ease-out);
}

.close:hover {
  border-color: var(--color-asphalt);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-1);
}

.action-link {
  display: inline-flex;
  align-items: center;
  padding: 0 var(--space-4);
  min-height: 42px;
  border: 2px solid var(--color-asphalt);
  font-weight: 800;
  font-size: var(--text-sm);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  transition: transform var(--duration-fast) var(--ease-out);
}

.action-link:hover {
  transform: translate(-1px, -1px);
}
</style>
