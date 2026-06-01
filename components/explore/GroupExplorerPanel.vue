<template>
  <aside class="panel" aria-label="Explorar grupos">
    <header class="panel__header">
      <div>
        <p class="eyebrow">Grupos encontrados</p>
        <strong>{{ groups.length }}</strong>
      </div>
      <ContributionLink :href="contributionFormUrl" context="new-group" />
    </header>

    <GroupFilters
      :model-value="filters"
      :days="days"
      :efforts="efforts"
      @update:model-value="$emit('update:filters', $event)"
      @clear="$emit('clear-filters')"
    />

    <p v-if="isLoading" class="state">Carregando grupos...</p>
    <div v-else-if="error" class="state state--error">
      <p>Não conseguimos carregar os grupos agora.</p>
      <button type="button" @click="$emit('retry')">Tentar novamente</button>
    </div>
    <div v-else-if="groups.length === 0" class="state">
      <p>Nenhum grupo encontrado com esses filtros.</p>
      <button type="button" @click="$emit('clear-filters')">Limpar filtros</button>
      <ContributionLink :href="contributionFormUrl" context="new-group" />
    </div>
    <div v-else class="list">
      <GroupCard
        v-for="group in groups"
        :key="group.id"
        :group="group"
        :is-selected="group.slug === selectedGroupSlug"
        @select="$emit('select', $event)"
      />
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { Group, GroupFilters as Filters } from '../../types/group'
import ContributionLink from '../contribution/ContributionLink.vue'
import GroupFilters from '../filters/GroupFilters.vue'
import GroupCard from '../group/GroupCard.vue'

defineProps<{
  groups: Group[]
  filters: Filters
  days: string[]
  efforts: string[]
  selectedGroupSlug?: string | null
  isLoading?: boolean
  error?: unknown
  contributionFormUrl?: string
}>()

defineEmits<{
  select: [slug: string]
  'update:filters': [filters: Filters]
  'clear-filters': []
  retry: []
}>()
</script>

<style scoped>
.panel {
  background: var(--color-paper);
  border: 2px solid var(--color-asphalt);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-panel);
  display: grid;
  gap: 16px;
  max-height: calc(100vh - 96px);
  overflow: auto;
  padding: 16px;
}

.panel__header {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.eyebrow {
  color: var(--color-bike-green);
  font-size: 0.75rem;
  font-weight: 900;
  margin: 0;
  text-transform: uppercase;
}

.list {
  display: grid;
  gap: 10px;
}

.state {
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  padding: 16px;
}

.state--error {
  border-color: var(--color-alert-red);
}
</style>
