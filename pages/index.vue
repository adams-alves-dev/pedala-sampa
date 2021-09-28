<template>
  <div id="ps-wrap" class="ps-wrap">
    <Map @groupName="groupName" />
  </div>
</template>

<script>
import Map from '@/components/Map'

export default {
  name: 'Home',
  components: { Map },
  head() {
    return {
      title: 'Home - Pedala Sampa',
      meta: [
        {
          hid: 'description_index',
          name: 'description',
          content:
            'Descubra os grupos de pedal perto de você na cidade de São Paulo',
        },
      ],
    }
  },
  methods: {
    groupName(event) {
      this.$router.push({
        path: `/grupo/${event.slug}`,
      })
    },
  },
}
</script>
