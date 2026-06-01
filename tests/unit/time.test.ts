import { describe, expect, it } from 'vitest'
import { getPeriodFromHour, getRhythmCategory, getEstimatedLapDuration } from '../../lib/time'

describe('time helpers', () => {
  it('calcula duração estimada da volta em horas e minutos', () => {
    expect(getEstimatedLapDuration({ distanceKm: 30, rhythmKmH: 15 })).toBe('02h:00m')
    expect(getEstimatedLapDuration({ distanceKm: 20, rhythmKmH: 18 })).toBe('01h:07m')
  })

  it('classifica período por horário', () => {
    expect(getPeriodFromHour('07:30')).toBe('morning')
    expect(getPeriodFromHour('14:00')).toBe('afternoon')
    expect(getPeriodFromHour('20:15')).toBe('night')
    expect(getPeriodFromHour('02:00')).toBe('night')
  })

  it('classifica ritmo por km/h', () => {
    expect(getRhythmCategory(12)).toBe('light')
    expect(getRhythmCategory(18)).toBe('moderate')
    expect(getRhythmCategory(26)).toBe('strong')
  })
})
