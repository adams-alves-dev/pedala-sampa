<template>
  <div class="app-layout">
    <AppHeader :contribution-form-url="contributionFormUrl" />
    <slot />
    <footer v-if="showFooter" class="app-footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <img src="/brand-logo.svg" width="22" height="26" alt="" >
          <span>Pedala Sampa</span>
        </div>
        <p class="footer-text">Mapa colaborativo de grupos de pedal em São Paulo.</p>
        <nav class="footer-nav" aria-label="Rodapé">
          <NuxtLink to="/about">Sobre</NuxtLink>
        </nav>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '../components/app/AppHeader.vue'

const config = useRuntimeConfig()
const route = useRoute()
const contributionFormUrl = config.public.contributionFormUrl
const showFooter = route.path !== '/'
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-footer {
  background: var(--header-bg);
  color: var(--header-fg);
  padding: var(--space-10) var(--space-6);
  border-top: 4px solid var(--color-sun);
}

.footer-inner {
  max-width: 980px;
  margin: 0 auto;
  display: grid;
  gap: var(--space-2);
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 800;
  letter-spacing: -0.02em;
}

.footer-text {
  font-size: var(--text-sm);
  margin: 0;
  color: color-mix(in srgb, var(--header-fg) 55%, transparent);
}

.footer-nav {
  margin-top: var(--space-3);
}

.footer-nav a {
  font-size: var(--text-sm);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-sun);
  text-decoration: none;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.footer-nav a:hover {
  opacity: 0.75;
}
</style>
