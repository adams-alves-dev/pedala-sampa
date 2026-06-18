/** Issue de validação por campo devolvida por uma server route. */
export type FormIssue = { path: string; message: string }

/**
 * Erro de uma server route de formulário: carrega o status HTTP e, quando é uma
 * falha de validação, as issues por campo. `FeedbackError`/`SuggestionError`
 * estendem esta base para preservar um `instanceof` distinto por fluxo.
 */
export class FormError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly issues?: FormIssue[],
  ) {
    super(message)
  }
}

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
