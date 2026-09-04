<template>
  <LTileLayer
    :key="tileUrl"
    :url="tileUrl"
    :attribution="attribution"
    :subdomains="subdomains"
    :max-zoom="19"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  buildTileUrl,
  variantFor,
  CARTO_SUBDOMAINS,
  OSM_SUBDOMAINS,
} from '../../lib/map-tiles'

// CARTO basemap (light/dark per theme) com API key; sem key, cai para tiles OSM.
const colorMode = useColorMode()
const { cartoApiKey } = useRuntimeConfig().public

const tileVariant = computed(() => variantFor(colorMode.value))
const tileUrl = computed(() => buildTileUrl(tileVariant.value, cartoApiKey))
const subdomains = computed(() =>
  cartoApiKey ? CARTO_SUBDOMAINS : OSM_SUBDOMAINS,
)

const attribution =
  '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> &middot; &copy; <a href="https://carto.com/attributions">CARTO</a>'
</script>
