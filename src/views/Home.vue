<template>
  <div class="home">
    <article class="card" v-for="Club in Clubs" :key="Club.id" :data-id="Club.id">
      <div class="content">
        <h3><a :href="Club.fields.link">{{ Club.fields.name }}</a> - <span>{{ Club.fields.effort }}</span></h3>
        <p>Local de concentração: <strong>{{ Club.fields.departure_location }}</strong> - {{ Club.fields.day }}, {{ Club.fields.start_hour }}</p>
      </div>
    </article>
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
