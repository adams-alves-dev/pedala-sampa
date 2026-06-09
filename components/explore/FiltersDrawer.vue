<template>
  <div>
    <div class="scrim" :class="{ open }" @click="$emit('close')" />
    <aside class="drawer" :class="{ open }" :inert="!open" aria-label="Filtros">
      <div class="drawer__head">
        <span class="drawer__title">Filtros</span>
        <button class="drawer__close" type="button" aria-label="Fechar filtros" @click="$emit('close')">×</button>
      </div>

      <div class="drawer__body">
        <div v-for="group in filterGroups" :key="group.key" class="filter-group">
          <span class="ps-fieldlabel">{{ group.label }}</span>
          <div class="chip-row">
            <button
              v-for="option in group.options"
              :key="option.value"
              class="ps-chip"
              :class="{ 'ps-chip--active': filters[group.key] === option.value }"
              type="button"
              :aria-pressed="filters[group.key] === option.value"
              @click="$emit('toggle', group.key, option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
      </div>

      <div class="drawer__foot">
        <button class="ps-btn ps-btn--ghost ps-btn--block" type="button" @click="$emit('clear')">Limpar</button>
        <button class="ps-cta ps-btn--block" type="button" @click="$emit('close')">Ver {{ resultCount }} grupos</button>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import type { FilterGroup } from '../../lib/filter-options'
import type { FilterCategory, GroupFilters } from '../../types/group'

const props = defineProps<{
  open: boolean
  filterGroups: FilterGroup[]
  filters: GroupFilters
  resultCount: number
}>()

const emit = defineEmits<{
  toggle: [key: FilterCategory, value: string]
  clear: []
  close: []
}>()

function onKeydown(event: KeyboardEvent) {
  if (props.open && event.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.scrim {
  position: absolute;
  inset: 0;
  z-index: 700;
  background: rgb(26 18 11 / 28%);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--duration-normal) var(--ease-out);
}

.scrim.open {
  opacity: 1;
  pointer-events: auto;
}

.drawer {
  position: absolute;
  z-index: 800;
  top: 0;
  bottom: 0;
  left: 0;
  width: 348px;
  max-width: 86vw;
  background: var(--color-paper);
  border-right: 2px solid var(--color-asphalt);
  box-shadow: var(--shadow-panel);
  transform: translateX(-104%);
  transition: transform var(--duration-normal) var(--ease-out);
  display: flex;
  flex-direction: column;
}

.drawer.open {
  transform: translateX(0);
}

.drawer__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  border-bottom: 2px solid var(--color-border);
}

.drawer__title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 800;
}

.drawer__close {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  cursor: pointer;
  border: 2px solid var(--color-asphalt);
  background: var(--color-paper);
  border-radius: 50%;
  font-size: 18px;
  font-weight: 800;
  color: var(--color-asphalt);
}

.drawer__body {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: var(--space-5);
  display: grid;
  gap: var(--space-5);
}

.drawer__foot {
  padding: var(--space-4) var(--space-5);
  border-top: 2px solid var(--color-border);
  display: flex;
  gap: var(--space-3);
}

.filter-group {
  display: grid;
  gap: var(--space-2);
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

@media (max-width: 760px) {
  .drawer {
    width: 100%;
    max-width: 100%;
    border-right: 0;
  }
}
</style>
