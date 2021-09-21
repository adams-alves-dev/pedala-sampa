<template>
  <div class="group">
    <section v-if="group" class="group-info">
      <h1>{{ group ? group.name : '' }}</h1>
      <div v-html="group.link.html"></div>
      <ul>
        <li v-for="info in group.groupInfos" :key="info.id">
          <p>Saída {{ info.startHour }}</p>
          <p>Dia: {{ info.day }}</p>
          <p>Nível: {{ info.effort }}</p>
          <p>Distância: {{ info.distance }} KM</p>
          <p>Ritmo: {{ info.rhythm }} KM/h</p>
          <p>
            Tempo médio da volta
            {{ FormattingLapDuration(info) }}
          </p>
        </li>
      </ul>
      <div>
        <NuxtLink to="/">Voltar</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script>
import moment from 'moment'
import { gql } from 'graphql-tag'

export default {
  methods: {
    FormattingLapDuration(info) {
      const lap = ((info.distance * 1000) / (info.rhythm / 3.6)) * 1000
      const lapDuration = moment.duration(lap)
      return `${lapDuration._data.hours}h:${
        lapDuration._data.minutes === 0 ? '00' : lapDuration._data.minutes
      }m`
    },
  },
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
              rhythm
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

<style lang="scss" scoped>
.group {
  width: 780px;
  margin: 0 auto;
  padding: 90px 20px 20px 20px;
}

@media (max-width: 768px) {
  .group {
    width: 100%;
    margin: 0 auto;
  }
}
</style>
