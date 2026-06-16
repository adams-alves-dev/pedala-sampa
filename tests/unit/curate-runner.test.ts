import { GraphQLClient } from 'graphql-request'
import { describe, expect, it, vi } from 'vitest'
import {
  applyCreate,
  applyUpdate,
  dryRunSummary,
  formatSuggestion,
  resolveUniqueSlug,
} from '../../scripts/curate-runner'
import type { PendingSuggestion } from '../../scripts/curate-runner'

/**
 * Cliente real (sem rede no construtor) com `request` espionado: devolve as
 * respostas na ordem em que as chamadas acontecem. Usar um GraphQLClient de
 * verdade dispensa cast — um stub `{ request }` não seria atribuível ao tipo.
 */
function clientWith(responses: object[]) {
  const client = new GraphQLClient('http://curation.test')
  const request = vi.spyOn(client, 'request')
  for (const response of responses) {
    request.mockResolvedValueOnce(response)
  }
  return { client, request }
}

const createSuggestion: PendingSuggestion = {
  id: 's1',
  type: 'CREATE',
  payload: null,
  justification: 'grupo novo do meu bairro',
  contactEmail: null,
  createdAt: '2026-06-01T12:00:00.000Z',
  group: null,
}

const updateSuggestion: PendingSuggestion = {
  id: 's2',
  type: 'UPDATE',
  payload: null,
  justification: 'corrigindo a distância',
  contactEmail: null,
  createdAt: '2026-06-02T12:00:00.000Z',
  group: { id: 'g1', slug: 'pedal-da-se', name: 'Pedal da Sé' },
}

const fullCreatePayload = {
  name: 'Pedal da Sé',
  latitude: -23.55,
  longitude: -46.63,
  linkUrl: 'https://instagram.com/pedaldase',
  address: 'Praça da Sé',
  day: 'Sábado',
  startHour: '07:00',
  effort: 'Moderado',
  distanceKm: 40,
  rhythmKmH: 25,
}

const currentGroup = {
  id: 'g1',
  name: 'Pedal da Sé',
  departureLocation: { latitude: -23.55, longitude: -46.63 },
}

describe('resolveUniqueSlug', () => {
  it('retorna o slug base quando está livre', async () => {
    const { client, request } = clientWith([{ group: null }])
    expect(await resolveUniqueSlug(client, 'Pedal da Sé')).toBe('pedal-da-se')
    expect(request).toHaveBeenCalledTimes(1)
  })

  it('sufixa -2 quando o slug base já existe', async () => {
    const { client } = clientWith([{ group: { id: 'g0' } }, { group: null }])
    expect(await resolveUniqueSlug(client, 'Pedal da Sé')).toBe('pedal-da-se-2')
  })
})

describe('applyCreate', () => {
  it('cria o grupo, marca APPROVED por último e devolve o slug', async () => {
    const { client, request } = clientWith([
      { group: null }, // slug livre
      { createGroup: { id: 'g1', slug: 'pedal-da-se' } },
      { updateSuggestion: { id: 's1' } }, // mark
    ])
    const result = await applyCreate(
      client,
      createSuggestion,
      fullCreatePayload,
    )
    expect(result).toBe('pedal-da-se')
    expect(request).toHaveBeenCalledTimes(3)
    expect(request).toHaveBeenLastCalledWith(expect.any(String), {
      id: 's1',
      status: 'APPROVED',
    })
  })

  it('avisa quando cria sem agenda completa', async () => {
    const { client } = clientWith([
      { group: null },
      { createGroup: { id: 'g1', slug: 'x' } },
      { updateSuggestion: { id: 's1' } },
    ])
    const result = await applyCreate(client, createSuggestion, {
      name: 'X',
      latitude: -23.5,
      longitude: -46.6,
    })
    expect(result).toContain('sem agenda')
  })

  it('se a marcação falha após criar, lança erro citando o grupo já criado', async () => {
    const { client, request } = clientWith([
      { group: null },
      { createGroup: { id: 'g1', slug: 'pedal-da-se' } },
    ])
    request.mockRejectedValueOnce(new Error('rede caiu'))

    let message = ''
    try {
      await applyCreate(client, createSuggestion, fullCreatePayload)
    } catch (error) {
      message = error instanceof Error ? error.message : String(error)
    }
    expect(message).toContain('pedal-da-se')
    expect(message).toContain('PENDENTE')
  })
})

describe('applyUpdate', () => {
  it('roteia campos de Group e de GroupInfo e marca APPROVED', async () => {
    const { client, request } = clientWith([
      { group: { ...currentGroup, groupInfos: [{ id: 'gi1' }] } },
      { updateGroup: { id: 'g1' } },
      { updateGroupInfo: { id: 'gi1' } },
      { updateSuggestion: { id: 's2' } },
    ])
    const result = await applyUpdate(client, updateSuggestion, {
      name: 'Pedal Novo',
      distanceKm: 50,
    })
    expect(result).toBe('Pedal da Sé')
    expect(request).toHaveBeenCalledTimes(4)
  })

  it('avisa e aplica na primeira quando há múltiplas agendas', async () => {
    const { client } = clientWith([
      {
        group: { ...currentGroup, groupInfos: [{ id: 'gi1' }, { id: 'gi2' }] },
      },
      { updateGroupInfo: { id: 'gi1' } },
      { updateSuggestion: { id: 's2' } },
    ])
    const result = await applyUpdate(client, updateSuggestion, {
      distanceKm: 50,
    })
    expect(result).toContain('2 agendas')
  })

  it('avisa quando não há GroupInfo para receber a agenda', async () => {
    const { client } = clientWith([
      { group: { ...currentGroup, groupInfos: [] } },
      { updateSuggestion: { id: 's2' } },
    ])
    const result = await applyUpdate(client, updateSuggestion, {
      distanceKm: 50,
    })
    expect(result).toContain('criar no Studio')
  })
})

describe('dryRunSummary', () => {
  it('descreve um CREATE com agenda', () => {
    const summary = dryRunSummary(createSuggestion, fullCreatePayload)
    expect(summary).toContain('criaria Group "Pedal da Sé"')
    expect(summary).toContain('+ 1 agenda')
  })

  it('descreve um DELETE como despublicação', () => {
    const del: PendingSuggestion = {
      ...createSuggestion,
      type: 'DELETE',
      group: { id: 'g1', slug: 'pedal-da-se', name: 'Pedal da Sé' },
    }
    expect(dryRunSummary(del, null)).toContain('despublicar pedal-da-se')
  })
})

describe('formatSuggestion', () => {
  it('inclui id, tipo, alvo e justificativa', () => {
    const out = formatSuggestion(updateSuggestion)
    expect(out).toContain('#s2')
    expect(out).toContain('UPDATE')
    expect(out).toContain('alvo: Pedal da Sé (pedal-da-se)')
    expect(out).toContain('justificativa: corrigindo a distância')
  })
})
