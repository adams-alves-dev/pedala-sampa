<template>
  <div id="ps-wrap" class="ps-wrap">
    <Map @groupName="groupName" />
  </div>
</template>

<script>
import Map from '@/components/Map'

export default {
  components: { Map },
  methods: {
    groupName(event) {
      this.$router.push({
        path: `/grupo/${event.slug}`,
      })
    },
  },
}
</script>
