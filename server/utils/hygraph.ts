type GraphQLResponse<T> = {
  data?: T
  errors?: Array<{ message: string }>
}

/**
 * Client GraphQL mínimo para as server routes. O token (`GRAPHQL_TOKEN`) só
 * existe no lado do servidor — nunca chega ao bundle do client.
 */
export async function hygraphRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const config = useRuntimeConfig()

  const response = await $fetch<GraphQLResponse<T>>(config.public.hygraphEndpoint, {
    method: 'POST',
    headers: config.hygraphToken ? { Authorization: `Bearer ${config.hygraphToken}` } : {},
    body: { query, variables },
  })

  if (response.errors?.length || !response.data) {
    throw new Error(response.errors?.[0]?.message || 'Resposta vazia do Hygraph')
  }

  return response.data
}
