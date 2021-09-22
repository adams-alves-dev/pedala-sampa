<template>
  <div id="map-wrap" class="map-wrap">
    <client-only>
      <l-map
        :zoom="zoom"
        :min-zoom="minZoom"
        :center="center"
        :max-bounds="maxBounds"
      >
        <CustomTileLayer />
        <l-marker
          v-for="group in groups"
          :key="group.id"
          :lat-lng="[
            group.departureLocation.latitude,
            group.departureLocation.longitude,
          ]"
          @click="
            handleClick({
              id: group.id,
              name: group.name,
              slug: group.slug,
            })
          "
        />
      </l-map>
    </client-only>
  </div>
</template>

<script>
import getGroups from '@/apollo/queries/groups/groups'
import CustomTileLayer from './CustomTileLayer.vue'

export default {
  name: 'Map',
  components: { CustomTileLayer },
  data() {
    return {
      zoom: 12.3,
      minZoom: 12.3,
      center: [-23.588053, -46.623798],
      maxBounds: [
        [-23.36, -46.84],
        [-24.0, -46.36],
      ],
    }
  },
  methods: {
    handleClick(group) {
      this.$emit('groupName', group)
    },
  },
  apollo: {
    groups: getGroups,
  },
}
</script>

<style>
.map-wrap {
  height: 100vh;
}
</style>
