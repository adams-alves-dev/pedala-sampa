<template>
  <ExploreShell
    :groups="filteredGroups"
    :filters="filters"
    :days="days"
    :efforts="efforts"
    :selected-group-slug="selectedGroupSlug"
    :selected-group="selectedGroup"
    :is-loading="pending"
    :error="error"
    :contribution-form-url="contributionFormUrl"
    @select="selectGroup"
    @update:filters="updateFilters"
    @clear-filters="clearFilters"
    @clear-selection="clearSelectedGroup"
    @retry="refresh"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ExploreShell from '../components/explore/ExploreShell.vue'
import { useGroupFilters } from '../composables/useGroupFilters'
import { useGroups } from '../composables/useGroups'
import { useSelectedGroup } from '../composables/useSelectedGroup'

const config = useRuntimeConfig()
const contributionFormUrl = config.public.contributionFormUrl

const { data, pending, error, refresh } = await useGroups()
const groups = computed(() => data.value || [])
const { filters, filteredGroups, updateFilters, clearFilters } = useGroupFilters(groups)
const { selectedGroupSlug, selectedGroup, selectGroup, clearSelectedGroup } = useSelectedGroup(groups)

const days = computed(() => [...new Set(groups.value.flatMap((group) => group.schedules.map((schedule) => schedule.day)))])
const efforts = computed(() => [
  ...new Set(groups.value.flatMap((group) => group.schedules.map((schedule) => schedule.effort))),
])

useSeoMeta({
  title: 'Pedala Sampa - Grupos de pedal em São Paulo',
  description: 'Encontre grupos de pedal em São Paulo por região, dia, horário, nível, distância e ritmo.',
})
</script>
