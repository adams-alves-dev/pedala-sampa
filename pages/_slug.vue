<template>
  <div v-if="page" class="page">
    <h1>{{ page.heading }}</h1>
    <p>{{ page.description }}</p>
    <div class="description" v-html="$md.render(page.body)"></div>
  </div>
</template>

<script>
import getPage from '@/apollo/queries/pages/page'

export default {
  name: 'Page',
  async asyncData({ app, route }) {
    const client = app.apolloProvider.defaultClient
    const slug = route.params.slug

    const res = await client.query({
      query: getPage,
      variables: {
        slug,
      },
    })

    const { page } = res.data
    return {
      page,
    }
  },
  head() {
    return {
      title: `${this.page.heading} - Pedala Sampa`,
      meta: [
        {
          hid: 'description_about',
          name: 'description',
          content:
            'Este é um projeto coloborativo para unir ciclistas que querem descobrir e participar de grupos de pedal!',
        },
      ],
    }
  },
}
</script>

<style lang="scss" scoped>
.page {
  width: 780px;
  margin: 0 auto;
  padding: 90px 20px 20px 20px;
  h1 {
    padding: 10px 0;
  }
}

@media (max-width: 768px) {
  .page {
    width: 100%;
    margin: 0 auto;
  }
}
</style>
