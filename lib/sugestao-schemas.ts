import { z } from 'zod'
import { SUGESTAO_TIPOS } from '../types/sugestao'

/**
 * Limites geográficos generosos da Grande São Paulo — pontos de saída em
 * cidades vizinhas (ABC, Guarulhos, Osasco) são válidos.
 */
export const SP_BOUNDS = {
  latMin: -24.2,
  latMax: -23.2,
  lngMin: -47.2,
  lngMax: -46.0,
} as const

/** Remove tags HTML e normaliza espaços — sugestões são texto puro. */
export function sanitizeText(value: string): string {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const textoCurto = (max: number) =>
  z.string().transform(sanitizeText).pipe(z.string().max(max, `Máximo de ${max} caracteres`))

const horaSchema = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Horário inválido (use o formato HH:MM)')

export const payloadSchema = z
  .object({
    name: textoCurto(120).pipe(z.string().min(2, 'Nome muito curto')),
    linkUrl: z
      .string()
      .trim()
      .url('Link inválido (inclua https://)')
      .max(500, 'Link longo demais'),
    address: textoCurto(200),
    day: textoCurto(40),
    startHour: horaSchema,
    effort: textoCurto(40),
    distanceKm: z
      .number('Distância deve ser um número')
      .positive('Distância deve ser maior que zero')
      .max(600, 'Distância improvável para um pedal'),
    rhythmKmH: z
      .number('Ritmo deve ser um número')
      .positive('Ritmo deve ser maior que zero')
      .max(60, 'Ritmo improvável para um pedal'),
    latitude: z
      .number('Latitude deve ser um número')
      .min(SP_BOUNDS.latMin, 'Latitude fora da região de São Paulo')
      .max(SP_BOUNDS.latMax, 'Latitude fora da região de São Paulo'),
    longitude: z
      .number('Longitude deve ser um número')
      .min(SP_BOUNDS.lngMin, 'Longitude fora da região de São Paulo')
      .max(SP_BOUNDS.lngMax, 'Longitude fora da região de São Paulo'),
  })
  .partial()

const baseSchema = z.object({
  tipo: z.enum(SUGESTAO_TIPOS, 'Tipo de sugestão inválido'),
  alvoId: z.string().trim().min(1).max(64).optional(),
  payload: payloadSchema.optional(),
  justificativa: textoCurto(1000).pipe(
    z.string().min(10, 'Conte um pouco mais — mínimo de 10 caracteres'),
  ),
  contatoEmail: z.union([z.literal(''), z.email('E-mail inválido').max(200)]).optional(),
  turnstileToken: z.string().max(4096).optional(),
  website: z.string().max(500).optional(),
})

/** Regras condicionais por tipo: alvo para UPDATE/DELETE, payload para CREATE/UPDATE. */
export const sugestaoSchema = baseSchema.superRefine((data, ctx) => {
  const precisaDeAlvo = data.tipo === 'UPDATE' || data.tipo === 'DELETE'
  const precisaDePayload = data.tipo === 'CREATE' || data.tipo === 'UPDATE'
  const camposPreenchidos = Object.values(data.payload ?? {}).filter(
    (value) => value !== undefined,
  ).length

  if (precisaDeAlvo && !data.alvoId) {
    ctx.addIssue({
      code: 'custom',
      path: ['alvoId'],
      message: 'Informe o grupo alvo da sugestão',
    })
  }

  if (precisaDePayload && camposPreenchidos === 0) {
    ctx.addIssue({
      code: 'custom',
      path: ['payload'],
      message:
        data.tipo === 'UPDATE'
          ? 'Altere ao menos um campo para sugerir uma correção'
          : 'Preencha os dados do grupo',
    })
  }

  if (data.tipo === 'CREATE') {
    for (const campo of ['name', 'latitude', 'longitude'] as const) {
      if (data.payload?.[campo] === undefined) {
        ctx.addIssue({
          code: 'custom',
          path: ['payload', campo],
          message:
            campo === 'name'
              ? 'Nome do grupo é obrigatório'
              : 'Ponto de saída no mapa é obrigatório',
        })
      }
    }
  }

  if (data.tipo === 'DELETE' && camposPreenchidos > 0) {
    ctx.addIssue({
      code: 'custom',
      path: ['payload'],
      message: 'Pedido de remoção não deve propor dados novos',
    })
  }
})

export type SugestaoValidada = z.infer<typeof sugestaoSchema>
