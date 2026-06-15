<template>
  <div class="location-picker">
    <LMap
      :zoom="initialZoom"
      :center="initialCenter"
      :min-zoom="10"
      :max-bounds="MAP_BOUNDS"
      :use-global-leaflet="false"
      :options="{ maxBoundsViscosity: 1 }"
      @ready="onMapReady"
      @click="onMapClick"
    >
      <MapTileLayer />
      <LMarker
        v-if="pin"
        :key="pinKey"
        :lat-lng="pin"
        :draggable="true"
        @dragend="onDragEnd"
      >
        <LIcon :icon-size="[36, 36]" :icon-anchor="[18, 34]" class-name="pin-wrap">
          <div class="ps-pin ps-pin--selected">
            <span><PsIcon name="bike" :size="16" /></span>
          </div>
        </LIcon>
      </LMarker>
    </LMap>

    <p v-if="outOfBounds" class="location-picker-warning" role="alert">
      Escolha um ponto dentro da Grande São Paulo.
    </p>
  </div>
</template>

<script setup lang="ts">
// só tipos no escopo do módulo: importar o leaflet como valor quebra o SSR
import type { DragEndEvent, LeafletMouseEvent, Map as LeafletMap } from 'leaflet'
import { computed, onBeforeUnmount, ref } from 'vue'
import { SP_BOUNDS, isInsideSpBounds } from '../../lib/sp-bounds'
import { parseNumber } from '../../lib/suggestion-form'
import MapTileLayer from '../map/MapTileLayer.vue'

// o estado vive nos campos do form — o mapa é só outra forma de editá-los
// (number aparece quando o visitante digita nos inputs type="number" do fallback)
const latitude = defineModel<string | number>('latitude', { required: true })
const longitude = defineModel<string | number>('longitude', { required: true })

// o mapa não deixa navegar para fora da região válida (viscosity 1 = parede dura)
const MAP_BOUNDS: [[number, number], [number, number]] = [
  [SP_BOUNDS.latMin, SP_BOUNDS.lngMin],
  [SP_BOUNDS.latMax, SP_BOUNDS.lngMax],
]

const pin = computed<[number, number] | null>(() => {
  const lat = parseNumber(latitude.value)
  const lng = parseNumber(longitude.value)
  return lat !== undefined && lng !== undefined ? [lat, lng] : null
})

// correção: abre já no ponto publicado; criação: visão geral de SP até o clique
const initialCenter: [number, number] = pin.value ?? [-23.576, -46.655]
const initialZoom = pin.value ? 15 : 11

// remontar o marker (key) devolve o pino ao último ponto válido após um arrasto rejeitado
const pinKey = ref(0)
const outOfBounds = ref(false)
let warningTimer: ReturnType<typeof setTimeout> | null = null

function flashOutOfBounds() {
  outOfBounds.value = true
  if (warningTimer) {
    clearTimeout(warningTimer)
  }
  warningTimer = setTimeout(() => {
    outOfBounds.value = false
    warningTimer = null
  }, 4000)
}

onBeforeUnmount(() => {
  if (warningTimer) {
    clearTimeout(warningTimer)
  }
})

function trySetPoint(lat: number, lng: number): boolean {
  if (!isInsideSpBounds(lat, lng)) {
    flashOutOfBounds()
    return false
  }
  // 5 casas decimais ≈ 1 m — precisão de sobra para um ponto de encontro
  latitude.value = lat.toFixed(5)
  longitude.value = lng.toFixed(5)
  outOfBounds.value = false
  return true
}

function onMapReady(map: LeafletMap) {
  // the container is sized by its parent; ensure tiles fill it
  setTimeout(() => map.invalidateSize(), 80)
}

function onMapClick(event: LeafletMouseEvent) {
  trySetPoint(event.latlng.lat, event.latlng.lng)
}

async function onDragEnd(event: DragEndEvent) {
  // import tardio: aqui já estamos no client e o leaflet já está carregado
  const { Marker } = await import('leaflet')
  if (event.target instanceof Marker) {
    const position = event.target.getLatLng()
    if (!trySetPoint(position.lat, position.lng)) {
      pinKey.value += 1
    }
  }
}
</script>

<style scoped>
.location-picker {
  position: relative;
  height: 100%;
  width: 100%;
}

.location-picker :deep(.leaflet-container) {
  cursor: crosshair;
}

.location-picker-warning {
  position: absolute;
  inset: auto var(--space-3) var(--space-3);
  z-index: 1000;
  margin: 0;
  padding: var(--space-2) var(--space-3);
  background: var(--color-paper);
  border: 2px solid var(--color-alert-red);
  color: var(--color-alert-red);
  font-weight: 700;
  font-size: var(--text-xs);
  text-align: center;
}
</style>
