import { extractLinkUrl, normalizeHour } from '../../../lib/group-normalizers'
import type { HygraphGroup } from '../../../types/hygraph'
import type {
  GroupRecord,
  GroupScheduleRecord,
} from '../../../types/suggestion'

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
      groupInfos(orderBy: createdAt_ASC) {
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

export default defineEventHandler(async (event): Promise<GroupRecord> => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      message: 'Slug do grupo é obrigatório',
    })
  }

  let data: { group: HygraphGroup | null }
  try {
    data = await hygraphRequest<{ group: HygraphGroup | null }>(
      GET_GROUP_RECORD_QUERY,
      { slug },
    )
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

  const infos = group.groupInfos ?? []
  // address/ponto são do grupo (compartilhados) — vêm da 1ª agenda, por convenção
  const firstInfo = infos[0]

  const schedules: GroupScheduleRecord[] = infos.map((info) => ({
    id: info.id,
    day: info.day || undefined,
    startHour: normalizeHour(info.startHour),
    effort: info.effort || undefined,
    distanceKm: typeof info.distance === 'number' ? info.distance : undefined,
    rhythmKmH: typeof info.rhythm === 'number' ? info.rhythm : undefined,
  }))

  // cache curto no CDN: o form de correção não precisa de dado fresquíssimo
  // e cada miss custa uma chamada autenticada ao Hygraph
  setResponseHeader(
    event,
    'Cache-Control',
    'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
  )

  return {
    id: group.id,
    slug: group.slug || group.id,
    name: group.name || 'Grupo sem nome',
    linkUrl: extractLinkUrl(group.link?.html),
    address: firstInfo?.address || undefined,
    latitude,
    longitude,
    schedules,
  }
})
