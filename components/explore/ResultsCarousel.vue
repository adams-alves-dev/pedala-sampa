<template>
  <div v-if="groups.length" class="carousel">
    <div class="carousel__meta">
      <span class="ps-chip ps-chip--count"
        ><strong>{{ groups.length }}</strong
        >&nbsp;grupos</span
      >
    </div>
    <div class="carousel__row">
      <button
        class="carousel__nav carousel__nav--prev"
        type="button"
        aria-label="Grupos anteriores"
        :disabled="!canPrev"
        @click="scroll(-1)"
      >
        <PsIcon name="chevronRight" :size="20" />
      </button>
      <div ref="trackRef" class="carousel__track" @scroll="updateNav">
        <GroupCard
          v-for="group in groups"
          :key="group.id"
          :group="group"
          :is-selected="group.slug === selectedGroupSlug"
          @select="$emit('select', $event)"
        />
      </div>
      <button
        class="carousel__nav carousel__nav--next"
        type="button"
        aria-label="Próximos grupos"
        :disabled="!canNext"
        @click="scroll(1)"
      >
        <PsIcon name="chevronRight" :size="20" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { scrollBehavior } from '../../lib/motion'
import type { Group } from '../../types/group'
import GroupCard from '../group/GroupCard.vue'

const props = defineProps<{
  groups: Group[]
  selectedGroupSlug?: string | null
}>()

defineEmits<{
  select: [slug: string]
}>()

const trackRef = ref<HTMLElement | null>(null)
const canPrev = ref(false)
const canNext = ref(false)

function updateNav() {
  const track = trackRef.value
  if (!track) {
    return
  }
  const overflow = track.scrollWidth - track.clientWidth > 4
  canPrev.value = overflow && track.scrollLeft > 2
  canNext.value =
    overflow && track.scrollLeft + track.clientWidth < track.scrollWidth - 2
}

function scroll(direction: number) {
  const track = trackRef.value
  if (!track) {
    return
  }
  track.scrollBy({
    left: direction * track.clientWidth * 0.8,
    behavior: scrollBehavior(),
  })
}

function scrollToSelected() {
  const track = trackRef.value
  if (!track || !props.selectedGroupSlug) {
    return
  }
  const index = props.groups.findIndex(
    (group) => group.slug === props.selectedGroupSlug,
  )
  const card = index >= 0 ? track.children[index] : null
  if (card instanceof HTMLElement) {
    track.scrollTo({ left: card.offsetLeft - 8, behavior: scrollBehavior() })
  }
}

watch(
  () => props.groups,
  () => nextTick(updateNav),
)
watch(
  () => props.selectedGroupSlug,
  () => nextTick(scrollToSelected),
)

onMounted(() => {
  nextTick(updateNav)
  window.addEventListener('resize', updateNav)
})
onBeforeUnmount(() => window.removeEventListener('resize', updateNav))
</script>

<style scoped>
.carousel {
  position: absolute;
  z-index: 500;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0 var(--space-4) var(--space-4);
}

.carousel__meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.carousel__row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.carousel__nav {
  flex: 0 0 auto;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border: 2px solid var(--color-asphalt);
  border-radius: 50%;
  background: var(--color-paper);
  color: var(--color-asphalt);
  cursor: pointer;
  box-shadow: var(--shadow-panel);
  transition:
    transform var(--duration-fast) var(--ease-out),
    opacity var(--duration-fast) var(--ease-out),
    background var(--duration-fast) var(--ease-out);
}

.carousel__nav:hover:not(:disabled) {
  transform: translateY(-1px);
  background: var(--color-sign-yellow);
}

.carousel__nav:disabled {
  opacity: 0.3;
  cursor: default;
  box-shadow: none;
}

.carousel__nav--prev :deep(svg) {
  transform: rotate(180deg);
}

.carousel__track {
  display: flex;
  gap: var(--space-3);
  overflow-x: auto;
  padding: var(--space-2) 2px;
  flex: 1 1 auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}

.carousel__track::-webkit-scrollbar {
  display: none;
}

.carousel__track :deep(.ps-card) {
  flex: 0 0 320px;
  scroll-snap-align: start;
  box-shadow: var(--shadow-panel);
}

@media (max-width: 760px) {
  .carousel {
    display: none;
  }
}
</style>
