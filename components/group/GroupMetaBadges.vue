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
  gap: 8px;
  margin: 0;
}

.badge {
  min-width: 72px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-paper);
  padding: 8px;
}

dt {
  color: rgb(21 21 21 / 68%);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
}

dd {
  margin: 2px 0 0;
  font-weight: 800;
}
</style>
