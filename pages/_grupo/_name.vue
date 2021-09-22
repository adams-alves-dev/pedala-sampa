<template>
  <div class="group">
    <section v-if="group" class="group-info">
      <h1>{{ group ? group.name : '' }}</h1>
      <div class="link">
        <p>Mais informações:</p>
        <div v-html="group.link.html"></div>
      </div>
      <ul>
        <li v-for="info in group.groupInfos" :key="info.id">
          <p>Saída {{ info.startHour }}</p>
          <p>Endereço: {{ info.address }}</p>
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
import getGroup from '@/apollo/queries/groups/group'

export default {
  name: 'Group',
  async asyncData({ app, route }) {
    const client = app.apolloProvider.defaultClient
    const slug = route.params.name

    const res = await client.query({
      query: getGroup,
      variables: {
        slug,
      },
    })

    const { group } = res.data
    return {
      group,
    }
  },
  head() {
    return {
      title: `${this.group.name} - Pedala Sampa`,
      meta: [
        {
          hid: 'description_group',
          name: 'description',
          content: `${this.group.name} - Grupo de pedal em São Paulo - Pedala Sampa`,
        },
      ],
    }
  },
  methods: {
    FormattingLapDuration(info) {
      const lap = ((info.distance * 1000) / (info.rhythm / 3.6)) * 1000
      const lapDuration = moment.duration(lap)
      return `${lapDuration._data.hours}h:${
        lapDuration._data.minutes === 0 ? '00' : lapDuration._data.minutes
      }m`
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
