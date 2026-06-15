<template>
  <section class="home" aria-label="Explorar grupos de pedal">
    <div class="home__map">
      <ClientOnly>
        <GroupMap
          :groups="filteredGroups"
          :selected-group-slug="selectedGroupSlug"
          @select="selectGroup"
          @clear-selection="clearSelectedGroup"
        />
        <template #fallback>
          <div class="home__map-fallback">Carregando mapa…</div>
        </template>
      </ClientOnly>
    </div>

    <MapToolbar
      :query="filters.query"
      :active-count="activeCount"
      @update:query="setQuery"
      @open-filters="drawerOpen = true"
    />

    <FiltersDrawer
      :open="drawerOpen"
      :filter-groups="filterGroups"
      :filters="filters"
      :result-count="filteredGroups.length"
      @toggle="toggleFilter"
      @clear="clearFilters"
      @close="drawerOpen = false"
    />

    <ResultsCarousel
      :groups="filteredGroups"
      :selected-group-slug="selectedGroupSlug"
      @select="selectGroup"
    />

    <EmptyState v-if="!filteredGroups.length" @clear="clearFilters" />

    <GroupQuickView :group="selectedGroup" @close="clearSelectedGroup" />

    <MobileSheet
      :groups="filteredGroups"
      :selected-group-slug="selectedGroupSlug"
      :filters="filters"
      :filter-groups="filterGroups"
      :active-count="activeCount"
      @open-filters="drawerOpen = true"
      @toggle="toggleFilter"
      @clear="clearFilters"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import EmptyState from '../components/explore/EmptyState.vue'
import FiltersDrawer from '../components/explore/FiltersDrawer.vue'
import GroupMap from '../components/map/GroupMap.client.vue'
import GroupQuickView from '../components/explore/GroupQuickView.vue'
import MapToolbar from '../components/explore/MapToolbar.vue'
import MobileSheet from '../components/explore/MobileSheet.vue'
import ResultsCarousel from '../components/explore/ResultsCarousel.vue'
import { useGroupFilters } from '../composables/useGroupFilters'
import { useGroups } from '../composables/useGroups'
import { useSelectedGroup } from '../composables/useSelectedGroup'
import { buildFilterGroups } from '../lib/filter-options'

const { data } = await useGroups()
const groups = computed(() => data.value || [])

const {
  filters,
  filteredGroups,
  activeCount,
  setQuery,
  toggleFilter,
  clearFilters,
} = useGroupFilters(groups)
const { selectedGroupSlug, selectedGroup, selectGroup, clearSelectedGroup } =
  useSelectedGroup(groups)

const drawerOpen = ref(false)

// a filter change can remove the selected group from the map/carousel — close
// the quick view instead of leaving it pointing at a group that is not visible
watch(filteredGroups, (visibleGroups) => {
  if (
    selectedGroupSlug.value &&
    !visibleGroups.some((group) => group.slug === selectedGroupSlug.value)
  ) {
    clearSelectedGroup()
  }
})

const days = computed(() => [
  ...new Set(
    groups.value.flatMap((group) =>
      group.schedules.map((schedule) => schedule.day),
    ),
  ),
])
const efforts = computed(() => [
  ...new Set(
    groups.value.flatMap((group) =>
      group.schedules.map((schedule) => schedule.effort),
    ),
  ),
])
const filterGroups = computed(() =>
  buildFilterGroups(days.value, efforts.value),
)

useSeoMeta({
  title: 'Pedala Sampa - Grupos de pedal em São Paulo',
  description:
    'Encontre grupos de pedal em São Paulo por região, dia, horário, nível, distância e ritmo.',
})
</script>

<style scoped>
.home {
  position: relative;
  height: calc(100vh - var(--header-height));
  /* clip (não hidden): hidden mantém o container rolável programaticamente,
     então focar algo do sheet abaixo da dobra (tap/teclado) rolava o .home e
     empurrava a toolbar para fora da tela, sem como o usuário rolar de volta.
     clip exige Safari 16+ — o hidden logo acima é o fallback de cascade para
     browsers antigos (não remover achando redundante) */
  overflow: hidden;
  overflow: clip;
}

.home__map {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: var(--color-concrete);
}

.home__map-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-weight: 600;
}
</style>
