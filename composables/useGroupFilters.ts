import { computed, ref } from 'vue'
import { countActiveFilters, createEmptyGroupFilters, filterGroups } from '../lib/group-filters'
import type { Group, GroupFilters } from '../types/group'

/** Filter categories that toggle on/off via chips (single selection each). */
type ToggleableKey = 'day' | 'effort' | 'distanceRange' | 'period' | 'rhythm'

export function useGroupFilters(groups: Ref<Group[]>) {
  const filters = ref<GroupFilters>(createEmptyGroupFilters())

  const filteredGroups = computed(() => filterGroups(groups.value, filters.value))
  const activeCount = computed(() => countActiveFilters(filters.value))

  function updateFilters(nextFilters: GroupFilters) {
    filters.value = nextFilters
  }

  function setQuery(query: string) {
    filters.value = { ...filters.value, query }
  }

  /** Set the category to `value`, or clear it when it already holds that value. */
  function toggleFilter<K extends ToggleableKey>(key: K, value: NonNullable<GroupFilters[K]>) {
    const next: GroupFilters = { ...filters.value }
    // the canonical "empty" value per field carries the correct type for `key`
    next[key] = next[key] === value ? createEmptyGroupFilters()[key] : value
    filters.value = next
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
    activeCount,
    updateFilters,
    setQuery,
    toggleFilter,
    clearFilters,
  }
}
