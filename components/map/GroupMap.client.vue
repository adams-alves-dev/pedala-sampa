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
import type { FitBoundsOptions, LatLngTuple, LeafletMouseEvent, Map as LeafletMap, PointTuple } from 'leaflet'
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

const FLY_ZOOM = 14

let mapInstance: LeafletMap | null = null

// mobile: the bottom sheet covers the lower half, so a centred pin lands behind
// it — shift the map centre down so the pin sits in the visible upper area.
const isMobileViewport = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches

function flyTarget(map: LeafletMap, latlng: PointTuple): PointTuple {
  if (!isMobileViewport()) {
    return latlng
  }
  const point = map.project(latlng, FLY_ZOOM)
  const center = map.unproject([point.x, point.y + map.getSize().y * 0.25], FLY_ZOOM)
  return [center.lat, center.lng]
}

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

// refit the map around the remaining pins whenever the filters change the list
function fitToGroups(map: LeafletMap) {
  const points: LatLngTuple[] = props.groups.map((group) => [
    group.departureLocation.latitude,
    group.departureLocation.longitude,
  ])
  if (!points.length) {
    return
  }
  const options: FitBoundsOptions = {
    paddingTopLeft: [48, 48],
    // on mobile the bottom sheet covers the lower area, so pad it out of the fit
    paddingBottomRight: [48, isMobileViewport() ? map.getSize().y * 0.4 : 48],
    maxZoom: FLY_ZOOM,
  }
  if (prefersReducedMotion()) {
    map.fitBounds(points, options)
  } else {
    map.flyToBounds(points, { ...options, duration: 0.6 })
  }
}

watch(
  () => props.groups.map((group) => group.slug).join(','),
  () => {
    if (mapInstance) {
      fitToGroups(mapInstance)
    }
  },
)

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
    const latlng: PointTuple = [group.departureLocation.latitude, group.departureLocation.longitude]
    const target = flyTarget(mapInstance, latlng)
    if (prefersReducedMotion()) {
      mapInstance.setView(target, FLY_ZOOM)
    } else {
      mapInstance.flyTo(target, FLY_ZOOM, { duration: 0.6 })
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
