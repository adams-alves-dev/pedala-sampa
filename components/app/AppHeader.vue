<template>
  <header class="app-header">
    <NuxtLink class="brand" to="/" aria-label="Pedala Sampa - mapa de grupos">
      <svg class="brand-icon" width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <circle cx="14" cy="14" r="6" fill="var(--color-sun)"/>
        <path d="M14 3v3M14 22v3M3 14h3M22 14h3M5.5 5.5l2 2M20.5 20.5l2 2M5.5 22.5l2-2M20.5 7.5l2-2" stroke="var(--color-sun)" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <span class="brand-text">Pedala Sampa</span>
      <span class="brand-badge">mapa colaborativo</span>
    </NuxtLink>
    <nav class="nav" aria-label="Navegação principal">
      <NuxtLink to="/" :aria-current="route.path === '/' ? 'page' : undefined">Mapa</NuxtLink>
      <NuxtLink to="/sobre" :aria-current="route.path === '/sobre' ? 'page' : undefined">Sobre</NuxtLink>
      <ContributionLink class="desktop-cta" :href="contributionFormUrl" context="new-group" />
    </nav>
  </header>
</template>

<script setup lang="ts">
import ContributionLink from '../contribution/ContributionLink.vue'

defineProps<{
  contributionFormUrl?: string
}>()

const route = useRoute()
</script>

<style scoped>
.app-header {
  align-items: center;
  background: var(--color-asphalt);
  display: flex;
  gap: var(--space-5);
  height: var(--header-height);
  justify-content: space-between;
  padding: 0 var(--space-6);
  position: sticky;
  top: 0;
  z-index: 1000;
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 32px) 100%, 0 100%);
}

.brand {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  text-decoration: none;
  color: var(--color-concrete);
}

.brand-icon {
  flex-shrink: 0;
}

.brand-text {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 800;
  letter-spacing: -0.02em;
}

.brand-badge {
  display: none;
  font-size: var(--text-xs);
  color: var(--color-sun);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-left: 2px solid rgb(255 179 0 / 25%);
  padding-left: var(--space-2);
}

.nav {
  align-items: center;
  display: flex;
  gap: var(--space-4);
}

.nav a {
  font-family: var(--font-body);
  font-weight: 800;
  text-decoration: none;
  font-size: var(--text-sm);
  color: rgb(232 224 208 / 75%);
  transition: color var(--duration-fast) var(--ease-out);
}

.nav a:hover {
  color: var(--color-concrete);
}

.nav a[aria-current='page'] {
  color: var(--color-sun);
}

.desktop-cta {
  margin-left: var(--space-2);
}

@media (min-width: 721px) {
  .brand-badge {
    display: inline;
  }
}

@media (max-width: 720px) {
  .app-header {
    padding: 0 var(--space-4);
    height: 64px;
    clip-path: none;
  }

  .brand-text {
    font-size: var(--text-md);
  }

  .desktop-cta {
    display: none;
  }
}
</style>
