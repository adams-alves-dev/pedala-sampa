<template>
  <div class="empty">
    <span class="empty__ic"><PsIcon name="search" :size="30" /></span>
    <strong class="ps-h3">Nenhum grupo encontrado com esses filtros.</strong>
    <p class="ps-body ps-state__msg">
      Tente afrouxar os filtros — ou ajude a comunidade cadastrando um grupo
      novo.
    </p>
    <div class="empty__actions">
      <button class="ps-btn" type="button" @click="$emit('clear')">
        Limpar filtros
      </button>
      <ContributionLink context="new-group" icon="plus" />
    </div>
  </div>
</template>

<script setup lang="ts">
import ContributionLink from '../contribution/ContributionLink.vue'

defineEmits<{
  clear: []
}>()
</script>

<style scoped>
.empty {
  position: absolute;
  z-index: 550;
  left: var(--space-4);
  bottom: var(--space-4);
  width: 360px;
  max-width: calc(100vw - 32px);
  background: var(--color-paper);
  border: 2px solid var(--color-asphalt);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-panel);
  padding: var(--space-5);
  display: grid;
  gap: var(--space-3);
}

.empty__ic {
  color: var(--color-asphalt-45);
}

.empty__actions {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

@media (max-width: 760px) {
  .empty {
    display: none;
  }
}
</style>
