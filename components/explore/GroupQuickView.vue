<template>
  <Transition name="qv">
    <div
      v-if="group"
      ref="panelRef"
      class="qv"
      tabindex="-1"
      aria-live="polite"
      @keydown.esc="$emit('close')"
    >
      <div class="ps-quickview">
        <button class="qv__close" type="button" @click="$emit('close')">
          <PsIcon name="x" :size="14" /> Fechar
        </button>
        <span class="ps-quickview__sun" aria-hidden="true" />
        <h2 class="qv__name">{{ group.name }}</h2>
        <p class="qv__loc">
          <PsIcon name="pin" :size="15" /> {{ group.departureAddress || 'Ponto de saída no mapa' }}
        </p>
        <GroupMetaBadges v-if="primarySchedule" :schedule="primarySchedule" />
        <p v-if="primarySchedule" class="qv__dur">
          <PsIcon name="compass" :size="16" /> Tempo médio da volta: <strong>{{ duration }}</strong>
        </p>
        <div class="qv__actions">
          <NuxtLink class="ps-btn ps-btn--sm ps-btn--solid" :to="`/group/${group.slug}`">
            Página completa <PsIcon name="chevronRight" :size="14" />
          </NuxtLink>
          <a
            v-if="group.link?.url"
            class="ps-btn ps-btn--sm"
            :href="group.link.url"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="(group.link.label || 'Contato') + ' (abre em nova aba)'"
          >
            <PsIcon name="chat" :size="15" /> {{ group.link.label || 'Contato' }} <PsIcon name="arrowUR" :size="14" />
          </a>
          <span v-else class="ps-btn ps-btn--sm ps-btn--ghost qv__nolink">Sem link</span>
          <ContributionLink context="correction" :slug="group.slug" icon="pencil" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { getEstimatedLapDuration } from '../../lib/time'
import type { Group } from '../../types/group'
import ContributionLink from '../contribution/ContributionLink.vue'
import GroupMetaBadges from '../group/GroupMetaBadges.vue'

const props = defineProps<{
  group: Group | null
}>()

defineEmits<{
  close: []
}>()

// move focus into the floating panel when it opens so keyboard users land
// here and can dismiss it with Escape (paridade com o drawer)
const panelRef = ref<HTMLElement | null>(null)
watch(
  () => props.group,
  (group) => {
    if (group) {
      nextTick(() => panelRef.value?.focus())
    }
  },
)

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
.qv {
  position: absolute;
  z-index: 600;
  right: var(--space-4);
  bottom: 120px;
  width: 380px;
  max-width: calc(100vw - 32px);
}

.qv-enter-active,
.qv-leave-active {
  transition: transform var(--duration-normal) var(--ease-out), opacity var(--duration-normal) var(--ease-out);
}

.qv-enter-from,
.qv-leave-to {
  transform: translateY(12px);
  opacity: 0;
}

.qv__close {
  justify-self: end;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 2px solid var(--color-border);
  padding: var(--space-1) var(--space-3);
  font-weight: 800;
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  border-radius: var(--radius-sm);
  color: var(--color-asphalt);
}

.qv__close:hover {
  border-color: var(--color-asphalt);
}

.qv__name {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0;
}

.qv__loc,
.qv__dur {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--text-sm);
  margin: 0;
}

.qv__loc {
  color: var(--color-asphalt-55);
}

.qv__dur {
  font-weight: 700;
}

.qv__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.qv__nolink {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 760px) {
  .qv {
    display: none;
  }
}
</style>
