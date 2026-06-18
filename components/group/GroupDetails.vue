<template>
  <article>
    <div class="group-head">
      <span class="ps-pin ps-pin--selected">
        <span><PsIcon name="bike" :size="18" /></span>
      </span>
      <h1 class="ps-h1 group-title">{{ group.name }}</h1>
    </div>

    <div class="group-grid">
      <div class="group-col">
        <section>
          <h2 class="section-title">
            <PsIcon name="calendar" :size="16" /> {{ agendaTitle }}
          </h2>

          <ul v-if="group.schedules.length" class="agenda-list">
            <li
              v-for="schedule in group.schedules"
              :key="schedule.id"
              class="agenda-item"
            >
              <GroupMetaBadges :schedule="schedule" />
              <p v-if="lapDuration(schedule)" class="agenda-dur">
                <PsIcon name="compass" :size="14" /> Volta média:
                <strong>{{ lapDuration(schedule) }}</strong>
              </p>
            </li>
          </ul>
          <p v-else class="ps-body group-muted">
            Agenda ainda não cadastrada para este grupo.
          </p>

          <ContributionLink
            context="schedule"
            :slug="group.slug"
            icon="plus"
            variant="ghost"
            class="agenda-add"
          />
        </section>

        <section>
          <h2 class="section-title">
            <PsIcon name="users" :size="16" /> Contato &amp; contribuição
          </h2>
          <div class="group-actions">
            <a
              v-if="group.link?.url"
              class="ps-btn ps-btn--solid ps-btn--block"
              :href="group.link.url"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="
                (group.link.label || 'Perfil / contato') + ' (abre em nova aba)'
              "
            >
              <PsIcon name="chat" :size="16" />
              {{ group.link.label || 'Perfil / contato' }}
              <PsIcon name="arrowUR" :size="15" />
            </a>
            <p v-else class="ps-body group-muted">
              Este grupo ainda não tem link de contato cadastrado.
            </p>
            <ContributionLink
              context="correction"
              :slug="group.slug"
              icon="pencil"
              fab
            />
            <p class="ps-body group-removal">
              É quem organiza o pedal e não quer o grupo no site?
              <NuxtLink :to="`/contribute/removal/${group.slug}`"
                >Solicitar remoção</NuxtLink
              >
            </p>
          </div>
        </section>
      </div>

      <section>
        <h2 class="section-title">
          <PsIcon name="pin" :size="16" /> Ponto de saída
        </h2>
        <div class="group-map">
          <GroupLocationMap
            :lat="group.departureLocation.latitude"
            :lng="group.departureLocation.longitude"
          />
        </div>
        <p class="ps-body group-addr">{{ departure }}, São Paulo</p>
      </section>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getEstimatedLapDuration } from '../../lib/time'
import type { Group, GroupSchedule } from '../../types/group'
import ContributionLink from '../contribution/ContributionLink.vue'
import GroupLocationMap from './GroupLocationMap.client.vue'
import GroupMetaBadges from './GroupMetaBadges.vue'

const props = defineProps<{
  group: Group
}>()

const agendaTitle = computed(() =>
  props.group.schedules.length > 1 ? 'Agendas' : 'Agenda',
)
const departure = computed(
  () => props.group.departureAddress || 'Ponto de saída no mapa',
)

// volta média por agenda (distância 0 / ritmo 0 = não informado → sem volta)
function lapDuration(schedule: GroupSchedule): string | null {
  return getEstimatedLapDuration({
    distanceKm: schedule.distanceKm,
    rhythmKmH: schedule.rhythmKmH,
  })
}
</script>

<style scoped>
.group-title {
  font-size: var(--text-2xl);
}

.agenda-list {
  display: grid;
  gap: var(--space-3);
  margin: 0 0 var(--space-4);
  padding: 0;
  list-style: none;
}

.agenda-item {
  display: grid;
  gap: var(--space-2);
  padding: var(--space-3);
  border: 2px solid var(--color-border);
}

.agenda-dur {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: var(--text-sm);
}

.agenda-add {
  margin-top: var(--space-1);
}

.group-actions {
  display: grid;
  gap: var(--space-3);
}

.group-muted {
  margin: 0;
  color: var(--color-asphalt-55);
}

.group-removal {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-asphalt-55);
}

.group-removal a {
  color: inherit;
  font-weight: 800;
  transition: color var(--duration-fast) var(--ease-out);
}

.group-removal a:hover {
  color: var(--color-asphalt);
}

.group-addr {
  margin: var(--space-2) 0 0;
  font-size: var(--text-base);
  color: var(--color-asphalt-55);
}
</style>
