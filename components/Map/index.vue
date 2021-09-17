<template>
  <div id="map-wrap" class="map-wrap">
    <client-only>
      <l-map
        :zoom="zoom"
        :min-zoom="minZoom"
        :center="center"
        :max-bounds="maxBounds"
      >
        <l-tile-layer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png" />
        <l-marker
          v-for="group in groups"
          :key="group.id"
          :lat-lng="[
            group.departureLocation.latitude,
            group.departureLocation.longitude,
          ]"
          @click="handleClick({ name: group.name, slug: group.slug })"
        />
      </l-map>
    </client-only>
  </div>
</template>

<script>
import { gql } from 'graphql-tag'

export default {
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
    groups: gql`
      query getGroups {
        groups {
          id
          name
          slug
          link {
            text
          }
          departureLocation {
            latitude
            longitude
          }
          groupInfos {
            id
            alternativeDepartureLocation {
              latitude
              longitude
            }
            startHour
            rhythm
            day
            rating
            effort
            distance
          }
        }
      }
    `,
  },
}
</script>

<style>
.map-wrap {
  height: 100vh;
}
</style>
