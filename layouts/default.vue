<template>
  <div class="app-layout">
    <AppHeader :contribution-form-url="contributionFormUrl" />
    <slot />
    <footer v-if="showFooter" class="app-footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <svg width="20" height="20" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <circle cx="14" cy="14" r="6" fill="var(--color-sun)"/>
            <path d="M14 3v3M14 22v3M3 14h3M22 14h3M5.5 5.5l2 2M20.5 20.5l2 2M5.5 22.5l2-2M20.5 7.5l2-2" stroke="var(--color-sun)" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span>Pedala Sampa</span>
        </div>
        <p class="footer-text">Mapa colaborativo de grupos de pedal em São Paulo.</p>
        <nav class="footer-nav" aria-label="Rodapé">
          <NuxtLink to="/sobre">Sobre</NuxtLink>
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
  background: var(--color-asphalt);
  color: var(--color-concrete);
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
  color: rgb(232 224 208 / 55%);
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
