<template>
  <div class="club">
    <div class="content">
      <h3>
        {{ Club.fields.name }} - <span>{{ Club.fields.effort }}</span>
      </h3>
      <p>Distância: <strong>{{ Club.fields.distance }} km</strong> - Ritmo <strong>{{ Club.fields.rhythm }} km/h</strong> - Duração: <strong>~ {{ FomattingLapDuration }}</strong> - Nota: {{ Club.fields.rating }}</p>
      <p>Local de concentração: <strong>{{ Club.fields.departure_location }}</strong> - {{ Club.fields.day }}, {{ Club.fields.start_hour }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Club',
  computed: {
    Club () {
      return this.$store.getters.getClubById(this.$route.params.id)
    },
    FomattingLapDuration () {
      const lap = this.Club.fields.lap_duration * 1000
      const moment = this.$moment.duration(lap)
      return `${moment._data.hours}h:${moment._data.minutes}m`
    }
  }
}
</script>

<style>

</style>
