<template>
  <header class="header">
    <h1 class="header__title"><router-link to="/">Pedala Sampa</router-link></h1>
    <nav class="header__nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </nav>
  </header>
</template>

<script>
export default {
  name: 'Header'
}
</script>

<style lang="stylus">
.header
  width 100%
  margin-top 20px
  lost-center 960px
  lost-utility clearfix
.header__title
  lost-column 1/2
.header__nav
  lost-column 1/3
  padding 30px
  a
    font-weight bold
    color #000
    text-decoration none
    &.router-link-exact-active
      color #ddd
      text-decoration underline
</style>
