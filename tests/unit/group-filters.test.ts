import { describe, expect, it } from 'vitest'
import { filterGroups, createEmptyGroupFilters } from '../../lib/group-filters'
import type { Group } from '../../types/group'

const groups: Group[] = [
  {
    id: '1',
    name: 'Pedal Centro',
    slug: 'pedal-centro',
    region: 'Centro',
    departureAddress: 'Praça da Sé',
    departureLocation: { latitude: -23.55, longitude: -46.63 },
    schedules: [{ id: 's1', day: 'Terça', startHour: '20:00', effort: 'Intermediário', distanceKm: 30, rhythmKmH: 18 }],
  },
  {
    id: '2',
    name: 'Iniciantes Zona Oeste',
    slug: 'iniciantes-zona-oeste',
    region: 'Zona Oeste',
    departureAddress: 'Butantã',
    departureLocation: { latitude: -23.57, longitude: -46.72 },
    schedules: [{ id: 's2', day: 'Sábado', startHour: '08:00', effort: 'Iniciante', distanceKm: 18, rhythmKmH: 14 }],
  },
]

describe('group filters', () => {
  it('cria filtro vazio', () => {
    expect(createEmptyGroupFilters()).toEqual({
      query: '',
      days: [],
      efforts: [],
      periods: [],
      rhythms: [],
    })
  })

  it('mantém todos os grupos quando o filtro está vazio', () => {
    expect(filterGroups(groups, createEmptyGroupFilters()).map((group) => group.slug)).toEqual([
      'pedal-centro',
      'iniciantes-zona-oeste',
    ])
  })

  it('filtra por texto', () => {
    expect(filterGroups(groups, { ...createEmptyGroupFilters(), query: 'oeste' }).map((group) => group.slug)).toEqual([
      'iniciantes-zona-oeste',
    ])
  })

  it('filtra por dia, nível, distância, período e ritmo', () => {
    const result = filterGroups(groups, {
      query: '',
      days: ['Sábado'],
      efforts: ['Iniciante'],
      distanceRange: 'up-to-20',
      periods: ['morning'],
      rhythms: ['light'],
    })

    expect(result.map((group) => group.slug)).toEqual(['iniciantes-zona-oeste'])
  })
})
