<template>
  <div id="custom-map-wrap" class="custom-map-wrap">
    <client-only>
      <l-map
        :zoom="zoom"
        :min-zoom="minZoom"
        :center="coordinates"
        :max-bounds="maxBounds"
      >
        <CustomTileLayer />
        <l-marker :lat-lng="coordinates" />
      </l-map>
    </client-only>
  </div>
</template>

<script>
import CustomTileLayer from './CustomTileLayer'

export default {
  name: 'CustomGroupMap',
  components: { CustomTileLayer },
  props: {
    coordinates: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      zoom: 15,
      minZoom: 10,
      maxBounds: [
        [-23.36, -46.84],
        [-24.0, -46.36],
      ],
    }
  },
}
</script>

<style>
.custom-map-wrap {
  height: 30vh;
}
</style>
