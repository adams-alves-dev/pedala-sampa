import { describe, expect, it } from 'vitest'
import { normalizeGroup, normalizeGroups } from '../../lib/group-normalizers'
import type { HygraphGroup } from '../../types/hygraph'

const group: HygraphGroup = {
  id: 'group-1',
  name: 'Pedal Centro',
  slug: 'pedal-centro',
  link: {
    text: 'Instagram',
    html: '<p><a href="https://example.com">Instagram</a></p>',
  },
  departureLocation: {
    latitude: -23.55,
    longitude: -46.63,
  },
  groupInfos: [
    {
      id: 'info-1',
      address: 'Praça da Sé',
      day: 'Terça',
      startHour: '20:00',
      effort: 'Intermediário',
      distance: 30,
      rhythm: 18,
      rating: 4,
    },
  ],
}

describe('group normalizers', () => {
  it('normaliza um grupo válido do Hygraph', () => {
    expect(normalizeGroup(group)).toEqual({
      id: 'group-1',
      name: 'Pedal Centro',
      slug: 'pedal-centro',
      departureAddress: 'Praça da Sé',
      departureLocation: {
        latitude: -23.55,
        longitude: -46.63,
      },
      link: {
        label: 'Instagram',
        url: 'https://example.com',
        html: '<p><a href="https://example.com">Instagram</a></p>',
      },
      schedules: [
        {
          id: 'info-1',
          day: 'Terça',
          startHour: '20:00',
          effort: 'Intermediário',
          distanceKm: 30,
          rhythmKmH: 18,
          rating: 4,
        },
      ],
    })
  })

  it('não preenche link.url quando o html não tem href', () => {
    const result = normalizeGroup({
      ...group,
      link: { text: 'Contato', html: '<p>Fale com a gente no evento</p>' },
    })
    expect(result?.link?.url).toBeUndefined()
  })

  it('limpa sequências de escape do rótulo do link', () => {
    const result = normalizeGroup({
      ...group,
      link: { text: '\\nFúria Norte Bikers\\n', html: '<p><a href="https://x.com">x</a></p>' },
    })
    expect(result?.link?.label).toBe('Fúria Norte Bikers')
  })

  it('retorna null para grupo sem coordenadas válidas', () => {
    expect(normalizeGroup({ ...group, departureLocation: null })).toBeNull()
  })

  it('remove grupos inválidos da lista', () => {
    expect(normalizeGroups([group, { ...group, id: 'bad', departureLocation: null }])).toHaveLength(1)
  })
})
