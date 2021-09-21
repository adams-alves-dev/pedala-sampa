<template>
  <div v-if="page" class="page">
    <h1>{{ page.heading }}</h1>
    <p>{{ page.description }}</p>
    <div v-html="page.body.html"></div>
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
            }
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
  padding-top: 100px;
}
</style>
