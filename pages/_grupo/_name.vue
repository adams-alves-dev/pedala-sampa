<template>
  <keep-alive>
    <div class="group">
      <section v-if="GET_GROUP" class="group-name-info">
        <h1 class="group-name">
          <NuxtLink to="/" class="arrow" />
          {{ GET_GROUP ? GET_GROUP.name : '' }}
        </h1>
        <CustomGroupMap
          :coordinates="[
            GET_GROUP.departureLocation.latitude,
            GET_GROUP.departureLocation.longitude,
          ]"
        />
        <ul class="group-info">
          <li
            v-for="info in GET_GROUP.groupInfos"
            :key="info.id"
            class="group-info-list"
          >
            <p class="group-info-item">Nível: {{ info.effort }}</p>
            <p class="group-info-item">Saída {{ info.startHour }}</p>
            <p v-if="info.address" class="group-info-item">
              Endereço: {{ info.address }}
            </p>
            <p class="group-info-item">Dia: {{ info.day }}</p>
            <p class="group-info-item">Distância: {{ info.distance }} KM</p>
            <p class="group-info-item">Ritmo: {{ info.rhythm }} KM/h</p>
            <p class="group-info-item">
              Tempo médio da volta:
              {{ FormattingLapDuration(info) }}
            </p>
          </li>
        </ul>
        <div class="link">
          <p class="link-desc">Mais informações:</p>
          <div class="link-group" v-html="GET_GROUP.link.html"></div>
        </div>
      </section>
    </div>
  </keep-alive>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import moment from 'moment'
import CustomGroupMap from '@/components/Map/CustomGroupMap.vue'

export default {
  name: 'Group',
  components: {
    CustomGroupMap,
  },
  head() {
    return {
      title: `${this.GET_GROUP ? this.GET_GROUP.name : ''} - Pedala Sampa`,
      meta: [
        {
          hid: 'description_group',
          name: 'description',
          content: `${
            this.GET_GROUP ? this.GET_GROUP.name : ''
          } - Grupo de pedal em São Paulo - Pedala Sampa`,
        },
      ],
    }
  },
  computed: {
    ...mapGetters(['GET_GROUP']),
  },
  mounted() {
    this.SET_GROUP()
  },
  methods: {
    ...mapActions(['SET_GROUP']),
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
.group-name {
  margin-bottom: 20px;
  .arrow {
    font-size: 2.5rem;
    text-decoration: none;
    color: #000;
    &::before {
      content: '←';
    }
  }
}
.group-info {
  display: flex;
  flex-grow: 1;
  list-style: none;
  padding: 0;
  margin: 20px 0;
  .group-info-list {
    line-height: 1.5rem;
    padding: 12px;
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
  .group-info {
    flex-direction: column;
  }
}
</style>
