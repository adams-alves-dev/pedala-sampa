import type { HygraphGroup } from '../../../types/hygraph'
import type { GroupRecord } from '../../../types/suggestion'

const GET_GROUP_RECORD_QUERY = /* GraphQL */ `
  query getGroupRecord($slug: String!) {
    group(where: { slug: $slug }) {
      id
      name
      slug
      link {
        html
      }
      departureLocation {
        latitude
        longitude
      }
      groupInfos {
        id
        startHour
        address
        day
        effort
        distance
        rhythm
      }
    }
  }
`

function extractLinkUrl(html?: string | null): string | undefined {
  const match = html?.match(/href\s*=\s*["']([^"']+)["']/i)
  return match ? match[1] : undefined
}

/** O CMS guarda horários como "20:30h" — o input type="time" exige "20:30". */
function normalizeHour(value?: string | null): string | undefined {
  const cleaned = value?.trim().replace(/h$/i, '')
  return cleaned || undefined
}

export default defineEventHandler(async (event): Promise<GroupRecord> => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, message: 'Slug do grupo é obrigatório' })
  }

  let data: { group: HygraphGroup | null }
  try {
    data = await hygraphRequest<{ group: HygraphGroup | null }>(GET_GROUP_RECORD_QUERY, { slug })
  } catch {
    throw createError({
      statusCode: 502,
      message: 'Não foi possível consultar o grupo no momento',
    })
  }

  const group = data.group
  const latitude = group?.departureLocation?.latitude
  const longitude = group?.departureLocation?.longitude

  if (!group || typeof latitude !== 'number' || typeof longitude !== 'number') {
    throw createError({ statusCode: 404, message: 'Grupo não encontrado' })
  }

  const info = group.groupInfos?.[0]

  return {
    id: group.id,
    slug: group.slug || group.id,
    name: group.name || 'Grupo sem nome',
    linkUrl: extractLinkUrl(group.link?.html),
    address: info?.address || undefined,
    day: info?.day || undefined,
    startHour: normalizeHour(info?.startHour),
    effort: info?.effort || undefined,
    distanceKm: typeof info?.distance === 'number' ? info.distance : undefined,
    rhythmKmH: typeof info?.rhythm === 'number' ? info.rhythm : undefined,
    latitude,
    longitude,
  }
})
