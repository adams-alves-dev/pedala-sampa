<template>
  <div v-if="page" class="page">
    <h1>{{ page.heading }}</h1>
    <p>{{ page.description }}</p>
    <div class="description" v-html="$md.render(page.desc)"></div>
  </div>
</template>

<script>
import { gql } from 'graphql-tag'

export default {
  apollo: {
    page: {
      query: gql`
        query getPage($slug: String!) {
          page(where: { slug: $slug }) {
            heading
            slug
            description
            body {
              html
              markdown
            }
            desc
          }
        }
      `,
      variables() {
        return {
          slug: this.$route.params.slug,
        }
      },
    },
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
