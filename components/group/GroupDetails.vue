<template>
  <article>
    <div class="group-head">
      <span class="ps-pin ps-pin--selected">
        <span><PsIcon name="bike" :size="18" /></span>
      </span>
      <h1 class="ps-h1 group-title">{{ group.name }}</h1>
    </div>

    <GroupMetaBadges v-if="primarySchedule" :schedule="primarySchedule" />

    <div class="group-grid">
      <div class="group-col">
        <section>
          <h2 class="section-title"><PsIcon name="calendar" :size="16" /> Agenda</h2>
          <div v-if="primarySchedule" class="meta-grid">
            <div class="meta-cell">
              <div class="ps-label">Dia &amp; saída</div>
              <div class="v">{{ primarySchedule.day }} · {{ primarySchedule.startHour }}</div>
            </div>
            <div class="meta-cell">
              <div class="ps-label">Ponto de saída</div>
              <div class="v v--addr">{{ departure }}</div>
            </div>
            <div class="meta-cell">
              <div class="ps-label">Distância</div>
              <div class="v">{{ primarySchedule.distanceKm }} km</div>
            </div>
            <div class="meta-cell">
              <div class="ps-label">Ritmo médio</div>
              <div class="v">{{ primarySchedule.rhythmKmH }} km/h</div>
            </div>
            <div class="meta-cell">
              <div class="ps-label">Nível</div>
              <div class="v">{{ primarySchedule.effort }}</div>
            </div>
            <div class="meta-cell">
              <div class="ps-label">Volta média</div>
              <div class="v">{{ duration }}</div>
            </div>
          </div>
          <p v-else class="ps-body group-muted">Agenda ainda não cadastrada para este grupo.</p>
        </section>

        <section>
          <h2 class="section-title"><PsIcon name="users" :size="16" /> Contato &amp; contribuição</h2>
          <div class="group-actions">
            <a
              v-if="group.link?.url"
              class="ps-btn ps-btn--solid ps-btn--block"
              :href="group.link.url"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="(group.link.label || 'Perfil / contato') + ' (abre em nova aba)'"
            >
              <PsIcon name="chat" :size="16" /> {{ group.link.label || 'Perfil / contato' }}
              <PsIcon name="arrowUR" :size="15" />
            </a>
            <p v-else class="ps-body group-muted">Este grupo ainda não tem link de contato cadastrado.</p>
            <ContributionLink context="correction" :slug="group.slug" icon="pencil" fab />
            <p class="ps-body group-removal">
              É quem organiza o pedal e não quer o grupo no site?
              <NuxtLink :to="`/contribute/removal/${group.slug}`">Solicitar remoção</NuxtLink>
            </p>
          </div>
        </section>
      </div>

      <section>
        <h2 class="section-title"><PsIcon name="pin" :size="16" /> Ponto de saída</h2>
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
import type { Group } from '../../types/group'
import ContributionLink from '../contribution/ContributionLink.vue'
import GroupLocationMap from './GroupLocationMap.client.vue'
import GroupMetaBadges from './GroupMetaBadges.vue'

const props = defineProps<{
  group: Group
}>()

const primarySchedule = computed(() => props.group.schedules[0])
const departure = computed(
  () => props.group.departureAddress || 'Ponto de saída no mapa',
)
const duration = computed(() =>
  primarySchedule.value
    ? getEstimatedLapDuration({
        distanceKm: primarySchedule.value.distanceKm,
        rhythmKmH: primarySchedule.value.rhythmKmH,
      })
    : '—',
)
</script>

<style scoped>
.group-title {
  font-size: var(--text-2xl);
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
}

.group-addr {
  margin: var(--space-2) 0 0;
  font-size: var(--text-base);
  color: var(--color-asphalt-55);
}
</style>
