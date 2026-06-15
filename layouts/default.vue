<template>
  <div class="app-layout">
    <AppHeader />
    <slot />
  </div>
</template>

<script setup lang="ts">
import AppHeader from '../components/app/AppHeader.vue'
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
