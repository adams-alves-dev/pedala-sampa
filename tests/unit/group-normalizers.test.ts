import { describe, expect, it } from 'vitest'
import { extractLinkUrl, normalizeGroup, normalizeGroups, normalizeHour } from '../../lib/group-normalizers'
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

describe('normalizeHour', () => {
  it('remove o sufixo "h" usado no CMS', () => {
    expect(normalizeHour('20:30h')).toBe('20:30')
    expect(normalizeHour('07:00H')).toBe('07:00')
  })

  it('preserva horários já limpos e trata vazios', () => {
    expect(normalizeHour('20:30')).toBe('20:30')
    expect(normalizeHour('  06:15  ')).toBe('06:15')
    expect(normalizeHour('')).toBeUndefined()
    expect(normalizeHour(null)).toBeUndefined()
    expect(normalizeHour(undefined)).toBeUndefined()
  })
})

describe('extractLinkUrl', () => {
  it('extrai o primeiro href do HTML de rich text', () => {
    expect(extractLinkUrl('<p><a href="https://instagram.com/pedal">Insta</a></p>')).toBe(
      'https://instagram.com/pedal',
    )
    expect(extractLinkUrl("<a href='https://x.com'>x</a>")).toBe('https://x.com')
  })

  it('retorna undefined sem href ou sem HTML', () => {
    expect(extractLinkUrl('<p>sem link</p>')).toBeUndefined()
    expect(extractLinkUrl('')).toBeUndefined()
    expect(extractLinkUrl(null)).toBeUndefined()
  })
})
