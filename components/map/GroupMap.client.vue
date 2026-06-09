<template>
  <div class="group-map">
    <LMap
      ref="mapRef"
      :zoom="ZOOM"
      :center="CENTER"
      :use-global-leaflet="false"
      :options="{ zoomControl: false }"
      @ready="onMapReady"
      @click="$emit('clear-selection')"
    >
      <LControlZoom position="bottomright" />
      <MapTileLayer />
      <LMarker
        v-for="(group, index) in groups"
        :key="`${group.id}${group.slug === selectedGroupSlug ? '-selected' : ''}`"
        :lat-lng="[group.departureLocation.latitude, group.departureLocation.longitude]"
        :z-index-offset="group.slug === selectedGroupSlug ? 1000 : 0"
        @click="onMarkerClick(group.slug, $event)"
      >
        <LIcon
          :icon-size="group.slug === selectedGroupSlug ? selectedSize : defaultSize"
          :icon-anchor="group.slug === selectedGroupSlug ? selectedAnchor : defaultAnchor"
          class-name="pin-wrap"
        >
          <div class="ps-pin" :class="{ 'ps-pin--selected': group.slug === selectedGroupSlug }">
            <span>{{ index + 1 }}</span>
          </div>
        </LIcon>
      </LMarker>
    </LMap>
  </div>
</template>

<script setup lang="ts">
import type { LeafletMouseEvent, Map as LeafletMap, PointTuple } from 'leaflet'
import { watch } from 'vue'
import { prefersReducedMotion } from '../../lib/motion'
import type { Group } from '../../types/group'
import MapTileLayer from './MapTileLayer.vue'

const props = defineProps<{
  groups: Group[]
  selectedGroupSlug?: string | null
}>()

const emit = defineEmits<{
  select: [slug: string]
  'clear-selection': []
}>()

// aligns with the prototype (PS.CENTER / PS.ZOOM)
const CENTER: PointTuple = [-23.576, -46.655]
const ZOOM = 12

const defaultSize: PointTuple = [28, 28]
const defaultAnchor: PointTuple = [14, 26]
const selectedSize: PointTuple = [36, 36]
const selectedAnchor: PointTuple = [18, 34]

let mapInstance: LeafletMap | null = null

function onMapReady(map: LeafletMap) {
  mapInstance = map
  // the map often mounts before its container has its final size
  setTimeout(() => map.invalidateSize(), 60)
}

function onMarkerClick(slug: string, event: LeafletMouseEvent) {
  // keep the click from also reaching the map (which would clear the selection)
  event.originalEvent.stopPropagation()
  emit('select', slug)
}

// fly to the selected group whenever the selection changes (card or pin)
watch(
  () => props.selectedGroupSlug,
  (slug) => {
    if (!mapInstance || !slug) {
      return
    }
    const group = props.groups.find((candidate) => candidate.slug === slug)
    if (!group) {
      return
    }
    const target: PointTuple = [group.departureLocation.latitude, group.departureLocation.longitude]
    if (prefersReducedMotion()) {
      mapInstance.setView(target, 14)
    } else {
      mapInstance.flyTo(target, 14, { duration: 0.6 })
    }
  },
)
</script>

<!-- Leaflet renders markers/containers outside the scoped tree, so these are global -->
<style>
.pin-wrap {
  overflow: visible;
}

.leaflet-container {
  font-family: var(--font-body);
  background: var(--color-concrete);
}

.leaflet-control-attribution {
  font-size: 10px;
  background: rgb(255 248 238 / 80%);
}
</style>

<style scoped>
.group-map {
  height: 100%;
  min-height: 360px;
  width: 100%;
}
</style>
