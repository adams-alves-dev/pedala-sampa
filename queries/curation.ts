// Queries e mutations usadas só pela CLI de curadoria (`scripts/curate.ts`).
// Todas falam a Content API do Hygraph, com o token privilegiado de curadoria.

/** Sugestões pendentes (em DRAFT), mais antigas primeiro. */
export const PENDING_SUGGESTIONS_QUERY = /* GraphQL */ `
  query pendingSuggestions {
    suggestions(
      where: { reviewStatus: PENDING }
      stage: DRAFT
      orderBy: createdAt_ASC
    ) {
      id
      type
      payload
      justification
      contactEmail
      createdAt
      group {
        id
        slug
        name
      }
    }
  }
`

/** Checagem de colisão de slug antes de criar um grupo. */
export const GROUP_BY_SLUG_QUERY = /* GraphQL */ `
  query groupBySlug($slug: String!) {
    group(where: { slug: $slug }) {
      id
    }
  }
`

/** Estado atual do grupo no UPDATE: nome/local (p/ completar diffs) + agendas. */
export const GROUP_FOR_UPDATE_QUERY = /* GraphQL */ `
  query groupForUpdate($id: ID!) {
    group(where: { id: $id }, stage: DRAFT) {
      id
      name
      departureLocation {
        latitude
        longitude
      }
      groupInfos {
        id
      }
    }
  }
`

export const CREATE_GROUP_MUTATION = /* GraphQL */ `
  mutation createGroup($data: GroupCreateInput!) {
    createGroup(data: $data) {
      id
      slug
    }
  }
`

export const UPDATE_GROUP_MUTATION = /* GraphQL */ `
  mutation updateGroup($id: ID!, $data: GroupUpdateInput!) {
    updateGroup(where: { id: $id }, data: $data) {
      id
    }
  }
`

export const UPDATE_GROUP_INFO_MUTATION = /* GraphQL */ `
  mutation updateGroupInfo($id: ID!, $data: GroupInfoUpdateInput!) {
    updateGroupInfo(where: { id: $id }, data: $data) {
      id
    }
  }
`

/** Marca a sugestão (APPROVED/REJECTED) no draft — nunca publica a Suggestion. */
export const MARK_SUGGESTION_MUTATION = /* GraphQL */ `
  mutation markSuggestion($id: ID!, $status: SuggestionStatus!) {
    updateSuggestion(where: { id: $id }, data: { reviewStatus: $status }) {
      id
    }
  }
`
