import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { useGroupFilters } from '../../composables/useGroupFilters'
import type { Group } from '../../types/group'

const groups: Group[] = [
  {
    id: '1',
    name: 'Pedal Centro',
    slug: 'pedal-centro',
    departureAddress: 'Praça da Sé',
    departureLocation: { latitude: -23.55, longitude: -46.63 },
    schedules: [
      {
        id: 's1',
        day: 'Terça',
        startHour: '20:00',
        effort: 'Intermediário',
        distanceKm: 30,
        rhythmKmH: 18,
      },
    ],
  },
  {
    id: '2',
    name: 'Iniciantes Zona Oeste',
    slug: 'iniciantes-zona-oeste',
    departureAddress: 'Butantã',
    departureLocation: { latitude: -23.57, longitude: -46.72 },
    schedules: [
      {
        id: 's2',
        day: 'Sábado',
        startHour: '08:00',
        effort: 'Iniciante',
        distanceKm: 18,
        rhythmKmH: 14,
      },
    ],
  },
]

describe('useGroupFilters', () => {
  it('ativa uma categoria, conta e filtra', () => {
    const { toggleFilter, filters, filteredGroups, activeCount } =
      useGroupFilters(ref(groups))
    toggleFilter('day', 'Sábado')
    expect(filters.value.day).toBe('Sábado')
    expect(activeCount.value).toBe(1)
    expect(filteredGroups.value.map((group) => group.slug)).toEqual([
      'iniciantes-zona-oeste',
    ])
  })

  it('reclicar na mesma opção limpa a categoria', () => {
    const { toggleFilter, filters } = useGroupFilters(ref(groups))
    toggleFilter('effort', 'Iniciante')
    expect(filters.value.effort).toBe('Iniciante')
    toggleFilter('effort', 'Iniciante')
    expect(filters.value.effort).toBe('')
  })

  it('ignora valor inválido em categoria de união (sem cast)', () => {
    const { toggleFilter, filters } = useGroupFilters(ref(groups))
    toggleFilter('distanceRange', 'valor-invalido')
    expect(filters.value.distanceRange).toBeUndefined()
    toggleFilter('rhythm', 'turbo')
    expect(filters.value.rhythm).toBe('')
    // valor válido é aceito
    toggleFilter('distanceRange', 'up-to-20')
    expect(filters.value.distanceRange).toBe('up-to-20')
  })

  it('limpar zera as categorias mas mantém a busca', () => {
    const { setQuery, toggleFilter, clearFilters, filters, activeCount } =
      useGroupFilters(ref(groups))
    setQuery('centro')
    toggleFilter('day', 'Sábado')
    toggleFilter('distanceRange', 'up-to-20')
    clearFilters()
    expect(filters.value.query).toBe('centro')
    expect(filters.value.day).toBe('')
    expect(filters.value.distanceRange).toBeUndefined()
    expect(activeCount.value).toBe(1) // só a busca
  })
})
