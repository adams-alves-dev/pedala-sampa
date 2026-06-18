import { describe, expect, it, vi } from 'vitest'
import { FeedbackError, createFeedback } from '../../lib/feedback-service'
import type { HygraphRequest } from '../../lib/hygraph-response'

const message = 'Senti falta de um filtro por bairro no mapa.'

describe('createFeedback', () => {
  it('cria feedback e retorna o id', async () => {
    const hygraph = vi.fn<HygraphRequest>(async () => ({
      createFeedback: { id: 'fb-1' },
    }))
    const result = await createFeedback({ message }, hygraph)

    expect(result).toEqual({ ok: true, id: 'fb-1' })
    expect(hygraph).toHaveBeenCalledTimes(1)
  })

  it('passa o e-mail à mutation quando informado', async () => {
    const hygraph = vi.fn<HygraphRequest>(async () => ({
      createFeedback: { id: 'fb-1' },
    }))
    await createFeedback({ message, contactEmail: 'foo@bar.com' }, hygraph)

    expect(hygraph).toHaveBeenCalledWith(
      expect.stringContaining('createFeedback'),
      expect.objectContaining({ contactEmail: 'foo@bar.com' }),
    )
  })

  it('retorna 400 para corpo inválido, com issues por campo', async () => {
    const hygraph = vi.fn<HygraphRequest>(async () => ({}))
    const promise = createFeedback({ message: 'oi' }, hygraph)

    await expect(promise).rejects.toBeInstanceOf(FeedbackError)
    await promise.catch((error: FeedbackError) => {
      expect(error.statusCode).toBe(400)
      expect(error.issues?.length).toBeGreaterThan(0)
    })
    expect(hygraph).not.toHaveBeenCalled()
  })

  it('retorna 502 quando o Hygraph falha', async () => {
    const hygraph: HygraphRequest = vi.fn(() =>
      Promise.reject(new Error('boom')),
    )
    const promise = createFeedback({ message }, hygraph)

    await expect(promise).rejects.toMatchObject({ statusCode: 502 })
  })

  it('retorna 502 quando a resposta não traz id', async () => {
    const hygraph = vi.fn<HygraphRequest>(async () => ({
      createFeedback: null,
    }))
    const promise = createFeedback({ message }, hygraph)

    await expect(promise).rejects.toMatchObject({ statusCode: 502 })
  })
})
