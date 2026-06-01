import { normalizeGroups } from '../lib/group-normalizers'
import { GET_GROUPS_QUERY } from '../queries/groups'
import type { HygraphGroup } from '../types/hygraph'

type GroupsResponse = {
  groups: HygraphGroup[]
}

export function useGroups() {
  const client = useHygraph()

  return useAsyncData('groups', async () => {
    const response = await client.request<GroupsResponse>(GET_GROUPS_QUERY)
    return normalizeGroups(response.groups)
  })
}
