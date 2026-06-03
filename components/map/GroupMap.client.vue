<template>
  <div class="group-map">
    <LMap ref="mapRef" :zoom="12" :center="center" :min-zoom="10" :max-bounds="maxBounds" :use-global-leaflet="false">
      <MapTileLayer />
      <LMarker
        v-for="group in groups"
        :key="group.id"
        :lat-lng="[group.departureLocation.latitude, group.departureLocation.longitude]"
        :icon="group.slug === selectedGroupSlug ? selectedIcon : defaultIcon"
        @click="$emit('select', group.slug)"
      >
        <LTooltip>{{ group.name }}</LTooltip>
      </LMarker>
    </LMap>
  </div>
</template>

<script setup lang="ts">
import L from 'leaflet'
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

// vue-leaflet types the marker `icon` prop as Icon; divIcon returns the
// DivIcon subtype, so cast to keep the toolchain happy (runtime is unaffected).
const defaultIcon = L.divIcon({
  className: '',
  html: `<div class="marker-pin"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
}) as L.Icon

const selectedIcon = L.divIcon({
  className: '',
  html: `<div class="marker-pin marker-pin--selected"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
}) as L.Icon
</script>

<style>
.marker-pin {
  width: 20px;
  height: 20px;
  background: var(--color-forest, #00796B);
  transform: rotate(45deg);
  border: 2.5px solid white;
  box-shadow: 0 2px 6px rgb(0 0 0 / 30%);
  transition: all var(--duration-fast) var(--ease-out);
}

.marker-pin--selected {
  width: 28px;
  height: 28px;
  background: var(--color-sun, #FFB300);
  border-width: 3px;
  box-shadow: 0 0 0 4px rgb(255 179 0 / 30%);
}
</style>

<style scoped>
.group-map {
  height: 100%;
  min-height: 360px;
  width: 100%;
}
</style>
