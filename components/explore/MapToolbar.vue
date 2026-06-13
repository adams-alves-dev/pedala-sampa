<template>
  <div class="toolbar">
    <div class="ps-search">
      <PsIcon name="search" :size="18" />
      <input
        :value="query"
        type="search"
        placeholder="Nome, bairro, dia ou nível"
        aria-label="Buscar grupos"
        @input="onInput"
      >
    </div>
    <button
      class="ps-btn ps-btn--solid filters-btn"
      :class="{ 'has-active': activeCount > 0 }"
      type="button"
      @click="$emit('open-filters')"
    >
      <PsIcon name="sliders" :size="16" />
      Filtros
      <span class="count-pill">{{ activeCount }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  query: string
  activeCount: number
}>()

const emit = defineEmits<{
  'update:query': [value: string]
  'open-filters': []
}>()

function onInput(event: Event) {
  if (event.target instanceof HTMLInputElement) {
    emit('update:query', event.target.value)
  }
}
</script>

<style scoped>
.toolbar {
  position: absolute;
  z-index: 500;
  top: var(--space-4);
  left: var(--space-4);
  right: var(--space-4);
  display: flex;
  gap: var(--space-3);
  align-items: flex-start;
}

.ps-search {
  flex: 0 1 420px;
  box-shadow: var(--shadow-panel);
  color: var(--color-asphalt);
}

.filters-btn {
  position: relative;
  box-shadow: var(--shadow-panel);
}

/* scoped (higher specificity) so the signage hover wins over the resting panel
   shadow — otherwise the global .ps-btn--solid:hover is overridden */
.filters-btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 4px 4px 0 var(--color-bike-green);
}

.count-pill {
  display: none;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  margin-left: 2px;
  background: var(--color-sun);
  color: var(--color-on-sun);
  border-radius: 999px;
  font-size: var(--text-xs);
  font-weight: 800;
}

.filters-btn.has-active .count-pill {
  display: inline-flex;
}

@media (max-width: 760px) {
  .toolbar {
    top: var(--space-3);
    left: var(--space-3);
    right: var(--space-3);
  }

  .ps-search {
    flex: 1 1 auto;
    min-height: 44px;
  }

  .filters-btn {
    display: none;
  }
}
</style>
