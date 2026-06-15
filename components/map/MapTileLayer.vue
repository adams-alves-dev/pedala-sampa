<template>
  <LTileLayer
    :key="tileVariant"
    :url="tileUrl"
    :attribution="attribution"
    :subdomains="'abcd'"
    :max-zoom="19"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

// CARTO basemap, light/dark per theme (Ciclovia → light, Noturno → dark).
const colorMode = useColorMode()

const attribution =
  '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> &middot; &copy; <a href="https://carto.com/attributions">CARTO</a>'

const tileVariant = computed(() => (colorMode.value === 'dark' ? 'dark_all' : 'light_all'))
const tileUrl = computed(
  () => `https://{s}.basemaps.cartocdn.com/${tileVariant.value}/{z}/{x}/{y}{r}.png`,
)
</script>
