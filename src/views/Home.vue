<template>
  <div class="home">
    <div>{{ records }}</div>
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: 'Home',
  data () {
    return {
      records: []
    }
  },
  mounted () {
    this.getData()
  },
  methods: {
    getData: function () {
      this.$api().then((res) => {
        this.records = res.data.records
      })
    }
  }
}
</script>
