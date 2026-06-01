<template>
  <div class="group-map">
    <LMap ref="mapRef" :zoom="12" :center="center" :min-zoom="10" :max-bounds="maxBounds" use-global-leaflet>
      <MapTileLayer />
      <LMarker
        v-for="group in groups"
        :key="group.id"
        :lat-lng="[group.departureLocation.latitude, group.departureLocation.longitude]"
        @click="$emit('select', group.slug)"
      >
        <LTooltip>{{ group.name }}</LTooltip>
      </LMarker>
    </LMap>
  </div>
</template>

<script setup lang="ts">
import type { Group } from '../../types/group'
import MapTileLayer from './MapTileLayer.vue'

defineProps<{
  groups: Group[]
  selectedGroupSlug?: string | null
}>()

defineEmits<{
  select: [slug: string]
}>()

const center: [number, number] = [-23.55, -46.623798]
const maxBounds: [[number, number], [number, number]] = [
  [-23.36, -46.84],
  [-24.0, -46.36],
]
</script>

<style scoped>
.group-map {
  height: 100%;
  min-height: 360px;
  width: 100%;
}
</style>
