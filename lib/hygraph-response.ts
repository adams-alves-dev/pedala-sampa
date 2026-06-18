/**
 * Assinatura mínima de um client GraphQL do Hygraph — injetada para facilitar
 * teste/mocking. Retorna `unknown` de propósito: cada serviço estreita a
 * resposta em runtime (ver `readIdFromResponse`).
 */
export type HygraphRequest = (
  query: string,
  variables?: Record<string, unknown>,
) => Promise<unknown>

/** Lê `data.<key>.id` de uma resposta GraphQL sem depender de type casts. */
export function readIdFromResponse(data: unknown, key: string): string | null {
  if (data && typeof data === 'object' && key in data) {
    const node = Reflect.get(data, key)
    if (node && typeof node === 'object' && 'id' in node) {
      const id = Reflect.get(node, 'id')
      if (typeof id === 'string') {
        return id
      }
    }
  }
  return null
}
