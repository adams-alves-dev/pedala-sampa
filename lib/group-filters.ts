import type { DistanceRange, Group, GroupFilters } from '../types/group'
import { getPeriodFromHour, getRhythmCategory } from './time'

export function createEmptyGroupFilters(): GroupFilters {
  return {
    query: '',
    days: [],
    efforts: [],
    periods: [],
    rhythms: [],
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
        group.region,
        group.departureAddress,
        ...group.schedules.flatMap((schedule) => [schedule.day, schedule.effort]),
      ]
        .filter(Boolean)
        .join(' '),
    )

    if (query && !searchable.includes(query)) {
      return false
    }

    return group.schedules.some((schedule) => {
      const matchesDay = filters.days.length === 0 || filters.days.includes(schedule.day)
      const matchesEffort = filters.efforts.length === 0 || filters.efforts.includes(schedule.effort)
      const matchesDistance = isInDistanceRange(schedule.distanceKm, filters.distanceRange)
      const matchesPeriod =
        filters.periods.length === 0 || filters.periods.includes(getPeriodFromHour(schedule.startHour))
      const matchesRhythm =
        filters.rhythms.length === 0 || filters.rhythms.includes(getRhythmCategory(schedule.rhythmKmH))

      return matchesDay && matchesEffort && matchesDistance && matchesPeriod && matchesRhythm
    })
  })
}
