<template>
  <header class="header">
    <NuxtLink to="/">
      <h1>Pedala Sampa</h1>
    </NuxtLink>
    <nav>
      <ul>
        <li>
          <NuxtLink to="/"> Mapa </NuxtLink>
        </li>
        <li>
          <NuxtLink :to="{ path: '/sobre' }"> Sobre </NuxtLink>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script>
export default {}
</script>

<style lang="scss" scoped>
.header {
  position: fixed;
  background: #fff;
  width: 100%;
  height: 60px;
  z-index: 1001;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 50px;
  -webkit-box-shadow: 0 0 15px rgb(0 0 0 / 10%);
  -moz-box-shadow: 0 0 15px rgb(0 0 0 / 10%);
  box-shadow: 0 0 15px rgb(0 0 0 / 10%);
  h1 {
    font-size: 2rem;
    line-height: 1.5rem;
  }
  a {
    text-decoration: none;
    color: #000;
  }
  nav {
    a {
      font-weight: bold;
    }
    ul {
      list-style: none;
      li {
        display: inline-block;
        text-decoration: none;
        margin-right: 20px;
      }
    }
  }
}
</style>
