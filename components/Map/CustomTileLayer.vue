<template>
  <l-tile-layer
    v-if="!$config.MAPBOX_USERID"
    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    url="https://{s}.tile.osm.org/{z}/{x}/{y}.png"
  />
  <l-tile-layer
    v-else
    attribution='© <a href="https://apps.mapbox.com/feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    :url="`https://api.mapbox.com/styles/v1/${$config.MAPBOX_USERID}/${$config.MAPBOX_STYLEID}/tiles/256/{z}/{x}/{y}@2x?access_token=${$config.MAPBOX_API_KEY}`"
  />
</template>

<script>
export default {
  name: 'CustomTileLayer',
}
</script>
