<template>
  <header class="ps-header">
    <NuxtLink class="ps-brand" to="/" aria-label="Pedala Sampa — início">
      <img src="/brand-logo.svg" width="38" height="44" alt="" >
      <span class="ps-brand__text">Pedala Sampa</span>
      <span class="ps-brand__badge">mapa colaborativo</span>
    </NuxtLink>

    <nav class="ps-nav" aria-label="Navegação principal">
      <span class="nav-desktop">
        <NuxtLink to="/" :aria-current="route.path === '/' ? 'page' : undefined">Mapa</NuxtLink>
        <NuxtLink to="/about" :aria-current="route.path === '/about' ? 'page' : undefined">Sobre</NuxtLink>
      </span>

      <button
        class="ps-theme-toggle"
        type="button"
        aria-label="Alternar entre tema claro e escuro"
        title="Tema claro / escuro"
        @click="toggleTheme"
      >
        <ClientOnly>
          <PsIcon :name="colorMode.value === 'noturno' ? 'sun' : 'moon'" :size="18" />
          <template #fallback><span class="toggle-ph" /></template>
        </ClientOnly>
      </button>

      <ContributionLink class="desktop-cta" context="new-group" icon="plus" />

      <button
        ref="burgerRef"
        class="ps-burger"
        type="button"
        :aria-expanded="menuOpen"
        :aria-label="menuOpen ? 'Fechar menu' : 'Abrir menu'"
        aria-haspopup="true"
        aria-controls="app-menu"
        @click="menuOpen = !menuOpen"
      >
        <span aria-hidden="true">≡</span>
      </button>
    </nav>

    <div v-show="menuOpen" id="app-menu" ref="menuRef" class="menu" @click="menuOpen = false">
      <NuxtLink to="/" :aria-current="route.path === '/' ? 'page' : undefined">Mapa</NuxtLink>
      <NuxtLink to="/about" :aria-current="route.path === '/about' ? 'page' : undefined">Sobre</NuxtLink>
      <NuxtLink to="/contribuir">+ Sugerir grupo</NuxtLink>
    </div>
  </header>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const route = useRoute()
const colorMode = useColorMode()

const menuOpen = ref(false)
const burgerRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)

function toggleTheme() {
  colorMode.preference = colorMode.value === 'noturno' ? 'ciclovia' : 'noturno'
}

// close the dropdown when navigating
watch(() => route.path, () => {
  menuOpen.value = false
})

// close the dropdown when clicking outside the burger/menu
function onDocumentClick(event: MouseEvent) {
  if (!menuOpen.value || !(event.target instanceof Node)) {
    return
  }
  if (burgerRef.value?.contains(event.target) || menuRef.value?.contains(event.target)) {
    return
  }
  menuOpen.value = false
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))
</script>

<style scoped>
.ps-header {
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-desktop {
  display: inline-flex;
  align-items: center;
  gap: var(--space-4);
}

.desktop-cta {
  margin-left: var(--space-2);
}

/* Round theme toggle (moon when light / sun when dark) */
.ps-theme-toggle {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex: 0 0 auto;
  border: 2px solid color-mix(in srgb, var(--header-fg) 40%, transparent);
  border-radius: 50%;
  background: transparent;
  color: var(--header-fg);
  cursor: pointer;
  transition: border-color var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out);
}

.ps-theme-toggle:hover {
  border-color: var(--header-fg);
  color: var(--color-sign-yellow);
}

.toggle-ph {
  width: 18px;
  height: 18px;
}

/* Burger (mobile only) */
.ps-burger {
  display: none;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 2px solid var(--header-fg);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--header-fg);
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
}

/* Mobile dropdown menu */
.menu {
  position: absolute;
  z-index: 1100;
  top: var(--header-height);
  right: var(--space-4);
  min-width: 200px;
  display: grid;
  gap: 2px;
  padding: var(--space-2);
  background: var(--color-paper);
  border: 2px solid var(--color-asphalt);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-panel);
}

.menu a {
  padding: 10px 12px;
  text-decoration: none;
  font-weight: 800;
  font-size: var(--text-sm);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-asphalt);
  border-radius: var(--radius-sm);
}

.menu a:hover {
  background: var(--color-concrete);
}

@media (max-width: 760px) {
  .ps-header {
    padding: 0 var(--space-4);
  }

  .nav-desktop,
  .desktop-cta {
    display: none;
  }

  .ps-brand__badge {
    display: none;
  }

  .ps-burger {
    display: grid;
  }
}
</style>
