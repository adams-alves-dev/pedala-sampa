import type { Group, GroupSchedule } from '../types/group'
import type { HygraphGroup, HygraphGroupInfo } from '../types/hygraph'

/** Pulls the first href out of the rich-text link HTML (e.g. `<p><a href="...">`). */
function extractLinkUrl(html?: string | null): string | undefined {
  if (!html) {
    return undefined
  }
  const match = html.match(/href\s*=\s*["']([^"']+)["']/i)
  return match ? match[1] : undefined
}

/** Hygraph stores the link label with stray escape sequences (e.g. `\nFúria\n`). */
function cleanLinkLabel(text?: string | null): string | undefined {
  if (!text) {
    return undefined
  }
  const cleaned = text
    .replace(/\\[rnt]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return cleaned || undefined
}

function normalizeSchedule(info: HygraphGroupInfo): GroupSchedule {
  return {
    id: info.id,
    day: info.day || 'Dia não informado',
    startHour: info.startHour || '00:00',
    effort: info.effort || 'Nível não informado',
    distanceKm: Number(info.distance || 0),
    rhythmKmH: Number(info.rhythm || 0),
    rating: typeof info.rating === 'number' ? info.rating : undefined,
  }
}

export function normalizeGroup(group: HygraphGroup): Group | null {
  const latitude = group.departureLocation?.latitude
  const longitude = group.departureLocation?.longitude

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return null
  }

  const schedules = (group.groupInfos || []).map(normalizeSchedule)
  const firstSchedule = schedules[0]
  const firstRawInfo = group.groupInfos?.[0]

  return {
    id: group.id,
    name: group.name || 'Grupo sem nome',
    slug: group.slug || group.id,
    departureAddress: firstRawInfo?.address || undefined,
    departureLocation: { latitude, longitude },
    link: group.link
      ? {
          label: cleanLinkLabel(group.link.text),
          url: extractLinkUrl(group.link.html),
          html: group.link.html || undefined,
        }
      : undefined,
    schedules: firstSchedule ? schedules : [],
  }
}

export function normalizeGroups(groups: HygraphGroup[]): Group[] {
  return groups
    .map((group) => normalizeGroup(group))
    .filter((group): group is Group => Boolean(group))
}
