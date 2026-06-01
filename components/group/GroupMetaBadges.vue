<template>
  <dl class="badges" aria-label="Resumo do grupo">
    <div class="badge">
      <dt>Dia</dt>
      <dd>{{ schedule.day }}</dd>
    </div>
    <div class="badge">
      <dt>Saída</dt>
      <dd>{{ schedule.startHour }}</dd>
    </div>
    <div class="badge">
      <dt>Nível</dt>
      <dd>{{ schedule.effort }}</dd>
    </div>
    <div class="badge">
      <dt>Distância</dt>
      <dd>{{ schedule.distanceKm }} km</dd>
    </div>
    <div class="badge">
      <dt>Ritmo</dt>
      <dd>{{ schedule.rhythmKmH }} km/h</dd>
    </div>
  </dl>
</template>

<script setup lang="ts">
import type { GroupSchedule } from '../../types/group'

defineProps<{
  schedule: GroupSchedule
}>()
</script>

<style scoped>
.badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin: 0;
}

.badge {
  min-width: 64px;
  border: 1px solid var(--color-border);
  background: var(--color-concrete);
  padding: var(--space-1) var(--space-2);
}

dt {
  color: rgb(26 18 11 / 55%);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

dd {
  margin: 1px 0 0;
  font-weight: 800;
  font-size: var(--text-sm);
}
</style>
