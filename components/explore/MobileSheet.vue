<template>
  <div ref="sheetRef" class="sheet" :class="{ dragging }" :data-snap="snap">
    <div
      class="sheet__grab"
      role="button"
      tabindex="0"
      :aria-label="snap === 'full' ? 'Recolher lista' : 'Expandir lista'"
      :aria-expanded="snap !== 'peek'"
      @pointerdown="onPointerDown"
      @keydown="onGrabKeydown"
    />

    <div class="sheet__head">
      <div class="sheet__headrow">
        <span class="ps-chip ps-chip--count"><strong>{{ groups.length }}</strong>&nbsp;grupos</span>
        <button
          class="ps-btn ps-btn--sm sheet__filtros"
          :class="{ 'has-active': activeCount > 0 }"
          type="button"
          @click="$emit('open-filters')"
        >
          <PsIcon name="sliders" :size="15" /> Filtros <span class="count-pill">{{ activeCount }}</span>
        </button>
      </div>
      <div class="sheet__chips">
        <button
          v-for="chip in quickChips"
          :key="`${chip.key}-${chip.value}`"
          class="ps-chip"
          :class="{ 'ps-chip--active': filters[chip.key] === chip.value }"
          type="button"
          :aria-pressed="filters[chip.key] === chip.value"
          @click="$emit('toggle', chip.key, chip.value)"
        >
          {{ chip.label }}
        </button>
      </div>
    </div>

    <div ref="bodyRef" class="sheet__body">
      <template v-if="groups.length">
        <GroupCard
          v-for="group in groups"
          :key="group.id"
          :group="group"
          :is-selected="group.slug === selectedGroupSlug"
          @select="onCardSelect"
        />
      </template>
      <div v-else class="sheet__empty">
        <PsIcon name="search" :size="26" />
        <strong>Nenhum grupo com esses filtros.</strong>
        <button class="ps-btn ps-btn--sm" type="button" @click="$emit('clear')">Limpar filtros</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { FilterGroup } from '../../lib/filter-options'
import { scrollBehavior } from '../../lib/motion'
import type { FilterCategory, Group, GroupFilters } from '../../types/group'
import GroupCard from '../group/GroupCard.vue'

type Snap = 'peek' | 'half' | 'full'

const props = defineProps<{
  groups: Group[]
  selectedGroupSlug?: string | null
  filters: GroupFilters
  filterGroups: FilterGroup[]
  activeCount: number
}>()

defineEmits<{
  'open-filters': []
  toggle: [key: FilterCategory, value: string]
  clear: []
}>()

const QUICK_KEYS: FilterCategory[] = ['effort', 'period', 'distanceRange']
const quickChips = computed(() =>
  props.filterGroups
    .filter((group) => QUICK_KEYS.includes(group.key))
    .flatMap((group) => group.options.map((option) => ({ key: group.key, value: option.value, label: option.label }))),
)

// mobile: tapping a card navigates straight to the group page (spec §8.1)
function onCardSelect(slug: string) {
  navigateTo(`/group/${slug}`)
}

// ---- Snap + drag ----
const SNAPS: Snap[] = ['peek', 'half', 'full']
const PEEK_OFFSET = 132

const sheetRef = ref<HTMLElement | null>(null)
const bodyRef = ref<HTMLElement | null>(null)
const snap = ref<Snap>('half')
const dragging = ref(false)

let startY = 0
let startTop = 0
let moved = false

function cycleSnap() {
  const index = SNAPS.indexOf(snap.value)
  snap.value = index >= SNAPS.length - 1 ? 'peek' : SNAPS[index + 1]
}

function onGrabKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    cycleSnap()
  }
}

function onPointerDown(event: PointerEvent) {
  const sheet = sheetRef.value
  if (!sheet) {
    return
  }
  dragging.value = true
  moved = false
  startY = event.clientY
  startTop = sheet.getBoundingClientRect().top
  window.addEventListener('pointermove', onPointerMove, { passive: false })
  window.addEventListener('pointerup', onPointerUp)
}

function onPointerMove(event: PointerEvent) {
  const sheet = sheetRef.value
  const parent = sheet?.offsetParent
  if (!sheet || !parent) {
    return
  }
  const delta = event.clientY - startY
  if (Math.abs(delta) > 4) {
    moved = true
  }
  const parentTop = parent.getBoundingClientRect().top
  const min = parentTop
  const max = parentTop + parent.clientHeight - PEEK_OFFSET
  const top = Math.min(Math.max(startTop + delta, min), max)
  sheet.style.transform = `translateY(${top - parentTop}px)`
  event.preventDefault()
}

function onPointerUp() {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  dragging.value = false

  const sheet = sheetRef.value
  const parent = sheet?.offsetParent
  if (!sheet || !parent) {
    return
  }
  if (!moved) {
    cycleSnap()
    sheet.style.transform = ''
    return
  }
  const parentTop = parent.getBoundingClientRect().top
  const ratio = (sheet.getBoundingClientRect().top - parentTop) / parent.clientHeight
  sheet.style.transform = ''
  snap.value = ratio < 0.25 ? 'full' : ratio < 0.65 ? 'half' : 'peek'
}

// pin selection (from the map) raises the sheet and scrolls to the card
watch(
  () => props.selectedGroupSlug,
  (slug) => {
    if (!slug) {
      return
    }
    if (snap.value === 'peek') {
      snap.value = 'half'
    }
    nextTick(() => {
      const body = bodyRef.value
      const index = props.groups.findIndex((group) => group.slug === slug)
      const card = body && index >= 0 ? body.children[index] : null
      if (body && card instanceof HTMLElement) {
        // align the card's top with the top of the list (clamps near the end)
        const delta = card.getBoundingClientRect().top - body.getBoundingClientRect().top
        body.scrollTo({ top: body.scrollTop + delta, behavior: scrollBehavior() })
      }
    })
  },
)

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
})
</script>

<style scoped>
.sheet {
  display: none;
}

@media (max-width: 760px) {
  .sheet {
    position: absolute;
    z-index: 600;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    height: 88vh;
    background: var(--color-paper);
    border: 2px solid var(--color-asphalt);
    border-top-left-radius: 18px;
    border-top-right-radius: 18px;
    box-shadow: var(--shadow-panel);
    transition: transform var(--duration-normal) var(--ease-out);
    touch-action: none;
  }

  .sheet.dragging {
    transition: none;
  }

  .sheet[data-snap='peek'] {
    transform: translateY(calc(100% - 132px));
  }

  .sheet[data-snap='half'] {
    transform: translateY(45%);
  }

  .sheet[data-snap='full'] {
    transform: translateY(0);
  }

  .sheet__grab {
    width: 48px;
    height: 5px;
    border-radius: 3px;
    background: var(--color-border);
    margin: 10px auto 8px;
    flex: 0 0 auto;
    cursor: grab;
  }

  .sheet__grab:active {
    cursor: grabbing;
  }

  .sheet__head {
    padding: 0 var(--space-4) var(--space-3);
    display: grid;
    gap: var(--space-3);
    flex: 0 0 auto;
    border-bottom: 2px solid var(--color-concrete-dk);
  }

  .sheet__headrow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
  }

  .sheet__filtros {
    position: relative;
    min-height: 36px;
  }

  .count-pill {
    display: none;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 5px;
    margin-left: 4px;
    background: var(--color-sign-yellow);
    color: var(--color-asphalt);
    border-radius: 999px;
    font-size: var(--text-xs);
    font-weight: 800;
  }

  .sheet__filtros.has-active .count-pill {
    display: inline-flex;
  }

  .sheet__chips {
    display: flex;
    gap: var(--space-2);
    overflow-x: auto;
    padding-bottom: 2px;
    scrollbar-width: none;
  }

  .sheet__chips::-webkit-scrollbar {
    display: none;
  }

  .sheet__body {
    flex: 1 1 auto;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y;
    padding: var(--space-3) var(--space-4) var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  /* keep cards at their content height (a <button> grid/flex item with
     overflow:hidden collapses otherwise) */
  .sheet__body :deep(.ps-card) {
    flex: 0 0 auto;
    box-shadow: none;
  }

  .sheet__empty {
    display: grid;
    justify-items: center;
    gap: var(--space-3);
    padding: var(--space-8) var(--space-4);
    text-align: center;
    color: var(--color-asphalt-55);
  }

  .sheet__empty :deep(svg) {
    color: var(--color-asphalt-45);
  }

  .sheet__empty strong {
    font-family: var(--font-display);
    font-size: var(--text-md);
    color: var(--color-asphalt);
  }
}
</style>
