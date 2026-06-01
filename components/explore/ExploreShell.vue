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
  gap: 16px;
  height: calc(100vh - var(--header-height));
  padding: 16px;
}

.map-area {
  border: 2px solid var(--color-asphalt);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.panel-area {
  display: grid;
  gap: 12px;
  overflow: auto;
}

.map-fallback {
  align-items: center;
  background: var(--color-concrete);
  display: flex;
  height: 100%;
  justify-content: center;
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
    border-radius: 16px 16px 0 0;
    bottom: 0;
    left: 0;
    max-height: 72vh;
    overflow: auto;
    padding: 12px;
    position: absolute;
    right: 0;
  }
}
</style>
