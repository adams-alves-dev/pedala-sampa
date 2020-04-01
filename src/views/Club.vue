<template>
  <div class="club">
    <div class="content" v-if="Club.fields">
      <h3>
        <a :href="Club.fields.link">{{ Club.fields.name }}</a> - <span>{{ Club.fields.effort }}</span>
      </h3>
      <p>Distância: <strong>{{ Club.fields.distance }} km</strong> - Ritmo <strong>{{ Club.fields.rhythm }} km/h</strong> - Duração: <strong>~ {{ FormattingLapDuration }}</strong> - Nota: {{ Club.fields.rating }}</p>
      <p>Local de concentração: <strong>{{ Club.fields.departure_location }}</strong> - {{ Club.fields.day }}, {{ Club.fields.start_hour }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Club',
  data () {
    return {
      Club: {}
    }
  },
  mounted () {
    const id = this.$route.params.id
    this.Club = this.$store.getters.getClubById(id) || JSON.parse(localStorage.getItem('Club'))
    // parse para o localStorage
    const parsed = JSON.stringify(this.Club)
    localStorage.setItem('Club', parsed)
  },
  computed: {
    FormattingLapDuration () {
      const lap = this.Club.fields.lap_duration * 1000
      const moment = this.$moment.duration(lap)
      return `${moment._data.hours}h:${moment._data.minutes}m`
    }
  }
}
</script>
