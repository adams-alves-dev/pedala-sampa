<template>
  <div class="home">
    <div>{{ Clubs }}</div>
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: 'Home',
  data () {
    return {
      Clubs: []
    }
  },
  mounted () {
    this.getData()
  },
  methods: {
    getData () {
      this.$api().then((res) => {
        this.configureClubs(res.data.records)
      })
    },
    configureClubs (Clubs) {
      this.Clubs = Clubs
      this.$store.commit('SetClubs', this.Clubs)
    }
  }
}
</script>
