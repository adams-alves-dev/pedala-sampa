<template>
  <div class="club">
    <div class="content">
      <h3>
        {{ Club.fields.name }} - <span>{{ Club.fields.effort }}</span>
      </h3>
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
    }
  }
}
</script>

<style>

</style>
