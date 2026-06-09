import { normalizeGroup } from '../lib/group-normalizers'
import { GET_GROUP_QUERY } from '../queries/groups'
import type { HygraphGroup } from '../types/hygraph'

type GroupResponse = {
  group: HygraphGroup | null
}

export function useGroup(slug: string) {
  const client = useHygraph()

  return useAsyncData(
    `group:${slug}`,
    async () => {
      const response = await client.request<GroupResponse>(GET_GROUP_QUERY, { slug })
      return response.group ? normalizeGroup(response.group) : null
    },
    // a missing group resolves to null on purpose; declaring the default keeps
    // Nuxt from warning about a nullish async return (and from refetching it)
    { default: () => null },
  )
}
