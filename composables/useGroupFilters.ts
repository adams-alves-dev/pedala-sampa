import { computed, ref } from 'vue'
import { createEmptyGroupFilters, filterGroups } from '../lib/group-filters'
import type { Group, GroupFilters } from '../types/group'

export function useGroupFilters(groups: Ref<Group[]>) {
  const filters = ref<GroupFilters>(createEmptyGroupFilters())

  const filteredGroups = computed(() => filterGroups(groups.value, filters.value))

  function updateFilters(nextFilters: GroupFilters) {
    filters.value = nextFilters
  }

  function clearFilters() {
    filters.value = {
      ...createEmptyGroupFilters(),
      query: filters.value.query,
    }
  }

  return {
    filters,
    filteredGroups,
    updateFilters,
    clearFilters,
  }
}
