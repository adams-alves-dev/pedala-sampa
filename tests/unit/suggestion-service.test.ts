import { describe, expect, it, vi } from 'vitest'
import { SuggestionError, createSuggestion } from '../../lib/suggestion-service'
import type { HygraphRequest } from '../../lib/suggestion-service'

const justification = 'O grupo mudou o ponto de saída no mês passado.'

function hygraphMock(responses: {
  group?: { id: string; name?: string; groupInfos?: { id: string }[] } | null
  createSuggestion?: { id: string } | null
}) {
  return vi.fn<HygraphRequest>(async (query) =>
    query.includes('createSuggestion')
      ? { createSuggestion: responses.createSuggestion ?? { id: 'sug-1' } }
      : { group: responses.group ?? null },
  )
}

describe('createSuggestion', () => {
  it('cria sugestão CREATE sem consultar alvo', async () => {
    const hygraph = hygraphMock({})
    const result = await createSuggestion(
      {
        type: 'CREATE',
        payload: { name: 'Pedal da Sé', latitude: -23.55, longitude: -46.63 },
        justification,
      },
      hygraph,
    )

    expect(result).toEqual({ ok: true, id: 'sug-1' })
    expect(hygraph).toHaveBeenCalledTimes(1)
  })

  it('retorna 400 para corpo inválido, com issues por campo', async () => {
    const hygraph = hygraphMock({})
    const promise = createSuggestion(
      { type: 'CREATE', justification: 'oi' },
      hygraph,
    )

    await expect(promise).rejects.toBeInstanceOf(SuggestionError)
    await promise.catch((error: SuggestionError) => {
      expect(error.statusCode).toBe(400)
      expect(error.issues?.length).toBeGreaterThan(0)
    })
    expect(hygraph).not.toHaveBeenCalled()
  })

  it('retorna 404 quando alvo de UPDATE não existe', async () => {
    const hygraph = hygraphMock({ group: null })
    const promise = createSuggestion(
      {
        type: 'UPDATE',
        targetId: 'nao-existe',
        payload: { name: 'Novo nome' },
        justification,
      },
      hygraph,
    )

    await expect(promise).rejects.toMatchObject({ statusCode: 404 })
    expect(hygraph).toHaveBeenCalledTimes(1)
  })

  it('confirma o alvo e cria sugestão DELETE', async () => {
    const hygraph = hygraphMock({ group: { id: 'grp-1' } })
    const result = await createSuggestion(
      { type: 'DELETE', targetId: 'grp-1', justification },
      hygraph,
    )

    expect(result).toEqual({ ok: true, id: 'sug-1' })
    expect(hygraph).toHaveBeenCalledTimes(2)
  })

  it('retorna o nome do grupo alvo (para dar contexto no aviso)', async () => {
    const hygraph = hygraphMock({ group: { id: 'grp-1', name: 'Pedal da Sé' } })
    const result = await createSuggestion(
      { type: 'DELETE', targetId: 'grp-1', justification },
      hygraph,
    )

    expect(result).toEqual({
      ok: true,
      id: 'sug-1',
      targetName: 'Pedal da Sé',
    })
  })

  it('retorna 404 quando a agenda alvo (scheduleId) não é do grupo', async () => {
    const hygraph = hygraphMock({
      group: { id: 'grp-1', groupInfos: [{ id: 'gi-1' }] },
    })
    const promise = createSuggestion(
      {
        type: 'DELETE',
        targetId: 'grp-1',
        payload: { scheduleId: 'gi-999' },
        justification,
      },
      hygraph,
    )

    await expect(promise).rejects.toMatchObject({ statusCode: 404 })
  })

  it('aceita quando a agenda alvo (scheduleId) pertence ao grupo', async () => {
    const hygraph = hygraphMock({
      group: { id: 'grp-1', groupInfos: [{ id: 'gi-1' }, { id: 'gi-2' }] },
    })
    const result = await createSuggestion(
      {
        type: 'UPDATE',
        targetId: 'grp-1',
        payload: { startHour: '20:00', scheduleId: 'gi-2' },
        justification,
      },
      hygraph,
    )

    expect(result).toEqual({ ok: true, id: 'sug-1' })
    expect(hygraph).toHaveBeenCalledTimes(2)
  })

  it('retorna 502 quando o Hygraph falha', async () => {
    const hygraph: HygraphRequest = vi.fn(() =>
      Promise.reject(new Error('boom')),
    )
    const promise = createSuggestion(
      {
        type: 'CREATE',
        payload: { name: 'Pedal da Sé', latitude: -23.55, longitude: -46.63 },
        justification,
      },
      hygraph,
    )

    await expect(promise).rejects.toMatchObject({ statusCode: 502 })
  })
})
