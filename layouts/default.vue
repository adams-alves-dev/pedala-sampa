<template>
  <div class="app-layout">
    <AppHeader :contribution-form-url="contributionFormUrl" />
    <slot />
  </div>
</template>

<script setup lang="ts">
import AppHeader from '../components/app/AppHeader.vue'

const config = useRuntimeConfig()
const contributionFormUrl = config.public.contributionFormUrl
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
