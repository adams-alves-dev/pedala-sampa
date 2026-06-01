<template>
  <aside class="panel" aria-label="Explorar grupos">
    <header class="panel__header">
      <div>
        <p class="eyebrow">Grupos encontrados</p>
        <strong class="panel__count">{{ groups.length }}</strong>
      </div>
      <ContributionLink :href="contributionFormUrl" context="new-group" fab />
    </header>

    <GroupFilters
      :model-value="filters"
      :days="days"
      :efforts="efforts"
      @update:model-value="$emit('update:filters', $event)"
      @clear="$emit('clear-filters')"
    />

    <div v-if="isLoading" class="skeleton-list">
      <div v-for="i in 3" :key="i" class="skeleton-card">
        <div class="skeleton-accent" />
        <div class="skeleton-body">
          <div class="skeleton-line skeleton-line--title" />
          <div class="skeleton-line skeleton-line--text" />
          <div class="skeleton-badges">
            <div v-for="j in 5" :key="j" class="skeleton-badge" />
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="error" class="state state--error">
      <p>Não conseguimos carregar os grupos agora.</p>
      <button type="button" class="state-btn" @click="$emit('retry')">Tentar novamente</button>
    </div>
    <div v-else-if="groups.length === 0" class="state state--empty">
      <svg class="empty-illus" width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
        <rect x="4" y="4" width="64" height="64" rx="2" stroke="var(--color-border)" stroke-width="2" stroke-dasharray="4 4" fill="none"/>
        <circle cx="42" cy="30" r="10" fill="var(--color-border)" opacity="0.35"/>
        <path d="M50 36l6 6" stroke="var(--color-border)" stroke-width="2.5" stroke-linecap="round" opacity="0.5"/>
        <path d="M20 48l4-2 3 1 3-1 4 2" stroke="var(--color-border)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.45"/>
        <circle cx="24" cy="48" r="3" fill="var(--color-forest)" opacity="0.5"/>
        <circle cx="44" cy="48" r="3" fill="var(--color-forest)" opacity="0.5"/>
      </svg>
      <p class="empty-text">Nenhum grupo encontrado</p>
      <button type="button" class="state-btn" @click="$emit('clear-filters')">Limpar filtros</button>
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
  display: grid;
  gap: var(--space-4);
  max-height: calc(100vh - 96px);
  overflow: auto;
  padding: var(--space-4);
}

.panel__header {
  align-items: center;
  display: flex;
  gap: var(--space-3);
  justify-content: space-between;
}

.eyebrow {
  color: rgb(26 18 11 / 45%);
  font-size: var(--text-xs);
  font-weight: 800;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.panel__count {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 800;
  line-height: 1;
}

.list {
  display: grid;
  gap: var(--space-2);
}

.state {
  border: 2px dashed var(--color-border);
  padding: var(--space-6) var(--space-4);
  text-align: center;
}

.state--error {
  border-color: var(--color-alert-red);
}

.state--empty {
  display: grid;
  gap: var(--space-3);
  justify-items: center;
}

.empty-illus {
  opacity: 0.7;
}

.empty-text {
  color: rgb(26 18 11 / 50%);
  font-weight: 600;
}

.state-btn {
  background: var(--color-asphalt);
  color: var(--color-concrete);
  border: 0;
  padding: var(--space-2) var(--space-4);
  font-weight: 800;
  font-size: var(--text-sm);
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  transition: transform var(--duration-fast) var(--ease-out);
}

.state-btn:hover {
  transform: translate(-1px, -1px);
}

@keyframes shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}

.skeleton-list {
  display: grid;
  gap: var(--space-2);
}

.skeleton-card {
  display: grid;
  grid-template-columns: 4px 1fr;
  border: 2px solid var(--color-border);
  background: var(--color-paper);
}

.skeleton-accent {
  width: 4px;
  background: var(--color-border);
}

.skeleton-body {
  padding: var(--space-4);
  display: grid;
  gap: var(--space-2);
}

.skeleton-line {
  height: 14px;
  background: linear-gradient(90deg, var(--color-border) 25%, transparent 50%, var(--color-border) 75%);
  background-size: 200px 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeleton-line--title {
  width: 70%;
  height: 20px;
}

.skeleton-line--text {
  width: 50%;
}

.skeleton-badges {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.skeleton-badge {
  width: 60px;
  height: 32px;
  background: linear-gradient(90deg, var(--color-border) 25%, transparent 50%, var(--color-border) 75%);
  background-size: 200px 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
</style>
