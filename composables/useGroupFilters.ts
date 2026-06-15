import { computed, ref } from 'vue'
import { DISTANCE_RANGES, PERIODS, RHYTHMS } from '../lib/filter-options'
import {
  countActiveFilters,
  createEmptyGroupFilters,
  filterGroups,
} from '../lib/group-filters'
import type { FilterCategory, Group, GroupFilters } from '../types/group'

/** Narrow a raw string to a typed union member (cast-free), or undefined. */
function findUnion<T extends string>(
  values: T[],
  value: string,
): T | undefined {
  return values.find((candidate) => candidate === value)
}

export function useGroupFilters(groups: Ref<Group[]>) {
  const filters = ref<GroupFilters>(createEmptyGroupFilters())

  const filteredGroups = computed(() =>
    filterGroups(groups.value, filters.value),
  )
  const activeCount = computed(() => countActiveFilters(filters.value))

  function setQuery(query: string) {
    filters.value = { ...filters.value, query }
  }

  /** Set the category to `value`, or clear it when it already holds that value. */
  function toggleFilter(key: FilterCategory, value: string) {
    const current = filters.value
    const isActive = current[key] === value
    filters.value = {
      ...current,
      day: key === 'day' ? (isActive ? '' : value) : current.day,
      effort: key === 'effort' ? (isActive ? '' : value) : current.effort,
      distanceRange:
        key === 'distanceRange'
          ? isActive
            ? undefined
            : findUnion(DISTANCE_RANGES, value)
          : current.distanceRange,
      period:
        key === 'period'
          ? isActive
            ? ''
            : (findUnion(PERIODS, value) ?? '')
          : current.period,
      rhythm:
        key === 'rhythm'
          ? isActive
            ? ''
            : (findUnion(RHYTHMS, value) ?? '')
          : current.rhythm,
    }
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
    setQuery,
    toggleFilter,
    clearFilters,
  }
}
