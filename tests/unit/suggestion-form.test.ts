import { describe, expect, it } from 'vitest'
import { diffPayload, emptyFields, fieldsFromRecord, payloadFromFields } from '../../lib/suggestion-form'
import type { GroupRecord } from '../../types/suggestion'

const record: GroupRecord = {
  id: 'grp-1',
  slug: 'pedal-da-se',
  name: 'Pedal da Sé',
  linkUrl: 'https://instagram.com/pedaldase',
  address: 'Praça da Sé, 1',
  day: 'Sábado',
  startHour: '07:00',
  effort: 'Iniciante',
  distanceKm: 25,
  rhythmKmH: 18,
  latitude: -23.55,
  longitude: -46.63,
}

describe('payloadFromFields', () => {
  it('descarta campos vazios e converte números (aceitando vírgula)', () => {
    const fields = { ...emptyFields(), name: ' Pedal Novo ', distanceKm: '32,5' }
    expect(payloadFromFields(fields)).toEqual({ name: 'Pedal Novo', distanceKm: 32.5 })
  })
})

describe('diffPayload', () => {
  it('retorna vazio quando nada mudou', () => {
    expect(diffPayload(fieldsFromRecord(record), record)).toEqual({})
  })

  it('contém apenas os campos alterados', () => {
    const fields = fieldsFromRecord(record)
    fields.address = 'Praça da Sé, 100'
    fields.startHour = '06:30'

    expect(diffPayload(fields, record)).toEqual({
      address: 'Praça da Sé, 100',
      startHour: '06:30',
    })
  })

  it('trata campo esvaziado como "sem alteração"', () => {
    const fields = fieldsFromRecord(record)
    fields.linkUrl = ''

    expect(diffPayload(fields, record)).toEqual({})
  })

  it('detecta mudança numérica sem falso positivo de formatação', () => {
    const fields = fieldsFromRecord(record)
    fields.distanceKm = '25,0'
    fields.rhythmKmH = '20'

    expect(diffPayload(fields, record)).toEqual({ rhythmKmH: 20 })
  })
})
