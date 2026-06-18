import { z } from 'zod'

/** Remove tags HTML e normaliza espaços — campos de texto livre são texto puro. */
export function sanitizeText(value: string): string {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Campo de texto sanitizado e limitado a `max` caracteres (Zod). */
export const shortText = (max: number) =>
  z
    .string()
    .transform(sanitizeText)
    .pipe(z.string().max(max, `Máximo de ${max} caracteres`))
