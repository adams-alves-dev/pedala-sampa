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
