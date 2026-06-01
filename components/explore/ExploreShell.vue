<template>
  <main class="explore-shell">
    <section class="map-area" aria-label="Mapa de grupos">
      <ClientOnly>
        <GroupMap :groups="groups" :selected-group-slug="selectedGroupSlug" @select="$emit('select', $event)" />
        <template #fallback>
          <div class="map-fallback">Carregando mapa...</div>
        </template>
      </ClientOnly>
    </section>
    <section class="panel-area">
      <GroupExplorerPanel
        :groups="groups"
        :filters="filters"
        :days="days"
        :efforts="efforts"
        :selected-group-slug="selectedGroupSlug"
        :is-loading="isLoading"
        :error="error"
        :contribution-form-url="contributionFormUrl"
        @select="$emit('select', $event)"
        @update:filters="$emit('update:filters', $event)"
        @clear-filters="$emit('clear-filters')"
        @retry="$emit('retry')"
      />
      <GroupQuickView :group="selectedGroup" :contribution-form-url="contributionFormUrl" @close="$emit('clear-selection')" />
    </section>
    <a
      v-if="contributionFormUrl"
      class="fab-cta"
      :href="contributionFormUrl"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Sugerir grupo (abre em nova aba)"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 5v14m-7-7h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
      </svg>
    </a>
  </main>
</template>

<script setup lang="ts">
import type { Group, GroupFilters as Filters } from '../../types/group'
import GroupMap from '../map/GroupMap.client.vue'
import GroupExplorerPanel from './GroupExplorerPanel.vue'
import GroupQuickView from './GroupQuickView.vue'

defineProps<{
  groups: Group[]
  filters: Filters
  days: string[]
  efforts: string[]
  selectedGroupSlug?: string | null
  selectedGroup: Group | null
  isLoading?: boolean
  error?: unknown
  contributionFormUrl?: string
}>()

defineEmits<{
  select: [slug: string]
  'update:filters': [filters: Filters]
  'clear-filters': []
  'clear-selection': []
  retry: []
}>()
</script>

<style scoped>
.explore-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 430px);
  gap: var(--space-4);
  height: calc(100vh - var(--header-height));
  padding: var(--space-4);
}

.map-area {
  border: 2px solid var(--color-asphalt);
  overflow: hidden;
}

.panel-area {
  display: grid;
  gap: var(--space-3);
  overflow: auto;
}

.map-fallback {
  align-items: center;
  background: var(--color-concrete);
  display: flex;
  height: 100%;
  justify-content: center;
  font-weight: 600;
}

.fab-cta {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  z-index: 900;
  width: 56px;
  height: 56px;
  display: none;
  align-items: center;
  justify-content: center;
  background: var(--color-sun);
  color: var(--color-asphalt);
  box-shadow: var(--shadow-panel);
  transition: transform var(--duration-fast) var(--ease-out);
  text-decoration: none;
  clip-path: polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px);
}

.fab-cta:hover {
  transform: scale(1.08);
}

@media (max-width: 860px) {
  .explore-shell {
    display: block;
    height: calc(100vh - var(--header-height));
    padding: 0;
    position: relative;
  }

  .map-area {
    border: 0;
    border-radius: 0;
    height: 100%;
  }

  .panel-area {
    background: var(--color-paper);
    border: 2px solid var(--color-asphalt);
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    bottom: 0;
    left: 0;
    max-height: 72vh;
    overflow: auto;
    padding: var(--space-3);
    position: absolute;
    right: 0;
  }

  .fab-cta {
    display: flex;
  }
}
</style>
