<template>
  <div>
    <h1>Group name: {{ group ? group.name : '' }}</h1>
    {{ group }}
  </div>
</template>

<script>
import { gql } from 'graphql-tag'

export default {
  apollo: {
    group: {
      query: gql`
        query getGroup($slug: String!) {
          group(where: { slug: $slug }) {
            id
            name
            slug
            link {
              text
              html
            }
            departureLocation {
              latitude
              longitude
            }
            groupInfos {
              id
              startHour
              day
              rating
              effort
              distance
              group {
                id
                name
              }
            }
          }
        }
      `,
      variables() {
        return {
          slug: this.$route.params.name,
        }
      },
    },
  },
}
</script>

<style></style>
