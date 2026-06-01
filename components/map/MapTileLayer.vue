<template>
  <LTileLayer v-if="mapboxUrl" :url="mapboxUrl" :attribution="mapboxAttribution" />
  <LTileLayer v-else url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" :attribution="osmAttribution" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const config = useRuntimeConfig()

const osmAttribution = '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
const mapboxAttribution =
  '© <a href="https://apps.mapbox.com/feedback/">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

const mapboxUrl = computed(() => {
  const userId = config.public.mapboxUserId
  const styleId = config.public.mapboxStyleId
  const apiKey = config.public.mapboxApiKey

  if (!userId || !styleId || !apiKey) {
    return ''
  }

  return `https://api.mapbox.com/styles/v1/${userId}/${styleId}/tiles/256/{z}/{x}/{y}@2x?access_token=${apiKey}`
})
</script>
