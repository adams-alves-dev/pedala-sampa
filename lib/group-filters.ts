import type { DistanceRange, Group, GroupFilters } from '../types/group'
import { getPeriodFromHour, getRhythmCategory } from './time'

export function createEmptyGroupFilters(): GroupFilters {
  return {
    query: '',
    day: '',
    effort: '',
    distanceRange: undefined,
    period: '',
    rhythm: '',
  }
}

function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

function isInDistanceRange(distanceKm: number, range?: DistanceRange) {
  if (!range) {
    return true
  }

  if (range === 'up-to-20') {
    return distanceKm <= 20
  }

  if (range === '20-to-40') {
    return distanceKm > 20 && distanceKm <= 40
  }

  return distanceKm > 40
}

export function filterGroups(groups: Group[], filters: GroupFilters) {
  const query = normalizeSearchText(filters.query)

  return groups.filter((group) => {
    const searchable = normalizeSearchText(
      [
        group.name,
        group.departureAddress,
        ...group.schedules.flatMap((schedule) => [schedule.day, schedule.effort]),
      ]
        .filter(Boolean)
        .join(' '),
    )

    if (query && !searchable.includes(query)) {
      return false
    }

    // Single selection per category; a group passes when one of its schedules
    // satisfies every active category at once.
    return group.schedules.some((schedule) => {
      const matchesDay = !filters.day || schedule.day === filters.day
      const matchesEffort = !filters.effort || schedule.effort === filters.effort
      const matchesDistance = isInDistanceRange(schedule.distanceKm, filters.distanceRange)
      const matchesPeriod = !filters.period || getPeriodFromHour(schedule.startHour) === filters.period
      const matchesRhythm = !filters.rhythm || getRhythmCategory(schedule.rhythmKmH) === filters.rhythm

      return matchesDay && matchesEffort && matchesDistance && matchesPeriod && matchesRhythm
    })
  })
}

/** Number of active filter categories, plus the search query when present. */
export function countActiveFilters(filters: GroupFilters): number {
  const categories: Array<keyof GroupFilters> = ['day', 'effort', 'distanceRange', 'period', 'rhythm']
  const activeCategories = categories.filter((key) => Boolean(filters[key])).length

  return activeCategories + (filters.query ? 1 : 0)
}
