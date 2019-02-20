<template>
  <div class="home">
    <div>{{ Records }}</div>
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: 'Home',
  data () {
    return {
      Records: []
    }
  },
  mounted () {
    this.getData()
  },
  methods: {
    getData () {
      this.$api().then((res) => {
        this.configureRecords(res.data.records)
      })
    },
    configureRecords (Records) {
      this.Records = Records
      this.$store.commit('SetRecords', this.Records)
    }
  }
}
</script>
