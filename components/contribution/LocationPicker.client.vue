<template>
  <div class="location-picker">
    <LMap
      :zoom="initialZoom"
      :center="initialCenter"
      :use-global-leaflet="false"
      @ready="onMapReady"
      @click="onMapClick"
    >
      <MapTileLayer />
      <LMarker v-if="pin" :lat-lng="pin" :draggable="true" @dragend="onDragEnd">
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
// só tipos no escopo do módulo: importar o leaflet como valor quebra o SSR
import type { DragEndEvent, LeafletMouseEvent, Map as LeafletMap } from 'leaflet'
import { computed } from 'vue'
import MapTileLayer from '../map/MapTileLayer.vue'

// o estado vive nos campos do form (strings) — o mapa é só outra forma de editá-los
const latitude = defineModel<string>('latitude', { required: true })
const longitude = defineModel<string>('longitude', { required: true })

function parseCoord(value: string): number | undefined {
  const trimmed = value.trim()
  if (!trimmed) {
    return undefined
  }
  const parsed = Number(trimmed.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : undefined
}

const pin = computed<[number, number] | null>(() => {
  const lat = parseCoord(latitude.value)
  const lng = parseCoord(longitude.value)
  return lat !== undefined && lng !== undefined ? [lat, lng] : null
})

// correção: abre já no ponto publicado; criação: visão geral de SP até o clique
const initialCenter: [number, number] = pin.value ?? [-23.576, -46.655]
const initialZoom = pin.value ? 15 : 11

function setPoint(lat: number, lng: number) {
  // 5 casas decimais ≈ 1 m — precisão de sobra para um ponto de encontro
  latitude.value = lat.toFixed(5)
  longitude.value = lng.toFixed(5)
}

function onMapReady(map: LeafletMap) {
  // the container is sized by its parent; ensure tiles fill it
  setTimeout(() => map.invalidateSize(), 80)
}

function onMapClick(event: LeafletMouseEvent) {
  setPoint(event.latlng.lat, event.latlng.lng)
}

async function onDragEnd(event: DragEndEvent) {
  // import tardio: aqui já estamos no client e o leaflet já está carregado
  const { Marker } = await import('leaflet')
  if (event.target instanceof Marker) {
    const position = event.target.getLatLng()
    setPoint(position.lat, position.lng)
  }
}
</script>

<style scoped>
.location-picker {
  height: 100%;
  width: 100%;
}

.location-picker :deep(.leaflet-container) {
  cursor: crosshair;
}
</style>
