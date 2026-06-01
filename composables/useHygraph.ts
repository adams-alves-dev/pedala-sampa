import { GraphQLClient } from 'graphql-request'

export function useHygraph() {
  const config = useRuntimeConfig()

  return new GraphQLClient(config.public.hygraphEndpoint, {
    headers: config.hygraphToken
      ? {
          Authorization: `Bearer ${config.hygraphToken}`,
        }
      : {},
  })
}
