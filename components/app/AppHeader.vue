<template>
  <header class="app-header">
    <NuxtLink class="brand" to="/" aria-label="Pedala Sampa - mapa de grupos">
      Pedala Sampa
    </NuxtLink>
    <nav class="nav" aria-label="Navegação principal">
      <NuxtLink to="/">Mapa</NuxtLink>
      <NuxtLink to="/sobre">Sobre</NuxtLink>
      <ContributionLink class="desktop-cta" :href="contributionFormUrl" context="new-group" />
    </nav>
  </header>
</template>

<script setup lang="ts">
import ContributionLink from '../contribution/ContributionLink.vue'

defineProps<{
  contributionFormUrl?: string
}>()
</script>

<style scoped>
.app-header {
  align-items: center;
  background: var(--color-paper);
  border-bottom: 2px solid var(--color-asphalt);
  display: flex;
  gap: 20px;
  height: var(--header-height);
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.brand {
  font-size: 1.25rem;
  font-weight: 950;
  text-decoration: none;
}

.nav {
  align-items: center;
  display: flex;
  gap: 14px;
}

.nav a {
  font-weight: 800;
  text-decoration: none;
}

@media (max-width: 720px) {
  .app-header {
    padding: 0 14px;
  }

  .desktop-cta {
    display: none;
  }
}
</style>
