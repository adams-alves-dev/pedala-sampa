<template>
  <div class="group">
    <section v-if="group" class="group-name-info">
      <h1>{{ group ? group.name : '' }}</h1>
      <ul class="group-info">
        <li
          v-for="info in group.groupInfos"
          :key="info.id"
          class="group-info-list"
        >
          <p class="group-info-item">Nível: {{ info.effort }}</p>
          <p class="group-info-item">Saída {{ info.startHour }}</p>
          <p class="group-info-item">Endereço: {{ info.address }}</p>
          <p class="group-info-item">Dia: {{ info.day }}</p>
          <p class="group-info-item">Distância: {{ info.distance }} KM</p>
          <p class="group-info-item">Ritmo: {{ info.rhythm }} KM/h</p>
          <p class="group-info-item">
            Tempo médio da volta
            {{ FormattingLapDuration(info) }}
          </p>
        </li>
      </ul>
      <div class="link">
        <p class="link-desc">Mais informações:</p>
        <div class="link-group" v-html="group.link.html"></div>
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
.group-info {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 20px 0;
  .group-info-list {
    line-height: 1.5rem;
  }
  .group-info-item:first-child {
    font-size: 1.2rem;
    font-weight: bold;
  }
  .group-info-item {
    font-size: 1rem;
  }
}

.link {
  display: flex;
  .link-desc {
    margin-right: 10px;
  }
}

@media (max-width: 768px) {
  .group {
    width: 100%;
    margin: 0 auto;
  }
}
</style>
