<template>
  <div class="loc-map">
    <LMap
      :zoom="14"
      :center="[lat, lng]"
      :use-global-leaflet="false"
      :options="{ zoomControl: false, scrollWheelZoom: false, attributionControl: false }"
      @ready="onMapReady"
    >
      <MapTileLayer />
      <LMarker :lat-lng="[lat, lng]">
        <LIcon :icon-size="[36, 36]" :icon-anchor="[18, 34]" class-name="pin-wrap">
          <div class="ps-pin ps-pin--selected">
            <span><PsIcon name="bike" :size="16" /></span>
          </div>
        </LIcon>
      </LMarker>
    </LMap>
  </div>
</template>

<script setup lang="ts">
import type { Map as LeafletMap } from 'leaflet'
import MapTileLayer from '../map/MapTileLayer.vue'

defineProps<{
  lat: number
  lng: number
}>()

function onMapReady(map: LeafletMap) {
  // the container is sized by its parent (.group-map); ensure tiles fill it
  setTimeout(() => map.invalidateSize(), 80)
}
</script>

<style scoped>
.loc-map {
  height: 100%;
  width: 100%;
}
</style>
