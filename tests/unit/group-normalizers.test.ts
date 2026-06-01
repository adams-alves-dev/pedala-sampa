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

  it('retorna null para grupo sem coordenadas válidas', () => {
    expect(normalizeGroup({ ...group, departureLocation: null })).toBeNull()
  })

  it('remove grupos inválidos da lista', () => {
    expect(normalizeGroups([group, { ...group, id: 'bad', departureLocation: null }])).toHaveLength(1)
  })
})
