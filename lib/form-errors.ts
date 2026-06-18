/** Issue de validação por campo devolvida por uma server route. */
export type FormIssue = { path: string; message: string }

/** Estreita o `data` de um erro da API para a lista de issues por campo (se houver). */
export function extractIssues(data: unknown): FormIssue[] {
  if (!Array.isArray(data)) {
    return []
  }
  return data.filter(
    (item): item is FormIssue =>
      typeof item === 'object' &&
      item !== null &&
      'path' in item &&
      typeof item.path === 'string' &&
      'message' in item &&
      typeof item.message === 'string',
  )
}
