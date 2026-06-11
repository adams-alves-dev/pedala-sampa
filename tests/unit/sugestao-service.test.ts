import { describe, expect, it, vi } from 'vitest'
import { SugestaoError, criarSugestao } from '../../lib/sugestao-service'
import type { HygraphRequest } from '../../lib/sugestao-service'

const justificativa = 'O grupo mudou o ponto de saída no mês passado.'

function hygraphMock(responses: {
  group?: { id: string } | null
  createSugestao?: { id: string } | null
}) {
  return vi.fn<HygraphRequest>(async (query) =>
    query.includes('createSugestao')
      ? { createSugestao: responses.createSugestao ?? { id: 'sug-1' } }
      : { group: responses.group ?? null },
  )
}

describe('criarSugestao', () => {
  it('cria sugestão CREATE sem consultar alvo', async () => {
    const hygraph = hygraphMock({})
    const result = await criarSugestao(
      {
        tipo: 'CREATE',
        payload: { name: 'Pedal da Sé', latitude: -23.55, longitude: -46.63 },
        justificativa,
      },
      hygraph,
    )

    expect(result).toEqual({ ok: true, id: 'sug-1' })
    expect(hygraph).toHaveBeenCalledTimes(1)
  })

  it('retorna 400 para corpo inválido, com issues por campo', async () => {
    const hygraph = hygraphMock({})
    const promise = criarSugestao({ tipo: 'CREATE', justificativa: 'oi' }, hygraph)

    await expect(promise).rejects.toBeInstanceOf(SugestaoError)
    await promise.catch((error: SugestaoError) => {
      expect(error.statusCode).toBe(400)
      expect(error.issues?.length).toBeGreaterThan(0)
    })
    expect(hygraph).not.toHaveBeenCalled()
  })

  it('retorna 404 quando alvo de UPDATE não existe', async () => {
    const hygraph = hygraphMock({ group: null })
    const promise = criarSugestao(
      { tipo: 'UPDATE', alvoId: 'nao-existe', payload: { name: 'Novo nome' }, justificativa },
      hygraph,
    )

    await expect(promise).rejects.toMatchObject({ statusCode: 404 })
    expect(hygraph).toHaveBeenCalledTimes(1)
  })

  it('confirma o alvo e cria sugestão DELETE', async () => {
    const hygraph = hygraphMock({ group: { id: 'grp-1' } })
    const result = await criarSugestao(
      { tipo: 'DELETE', alvoId: 'grp-1', justificativa },
      hygraph,
    )

    expect(result).toEqual({ ok: true, id: 'sug-1' })
    expect(hygraph).toHaveBeenCalledTimes(2)
  })

  it('retorna 502 quando o Hygraph falha', async () => {
    const hygraph: HygraphRequest = vi.fn(() => Promise.reject(new Error('boom')))
    const promise = criarSugestao(
      {
        tipo: 'CREATE',
        payload: { name: 'Pedal da Sé', latitude: -23.55, longitude: -46.63 },
        justificativa,
      },
      hygraph,
    )

    await expect(promise).rejects.toMatchObject({ statusCode: 502 })
  })
})
