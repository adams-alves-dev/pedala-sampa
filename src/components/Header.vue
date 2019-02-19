<template>
  <header>
    <h1>Pedala Sampa</h1>
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
  </header>
</template>

<script>
export default {
  name: 'Header'
}
</script>

<style lang="stylus">
#nav
  padding 30px
  a
    font-weight bold
    color #000
    text-decoration none
    &.router-link-exact-active
      color #ddd
      text-decoration underline
</style>
