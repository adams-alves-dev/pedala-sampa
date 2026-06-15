import { describe, expect, it } from 'vitest'
import {
  getPeriodFromHour,
  getRhythmCategory,
  getEstimatedLapDuration,
  getRhythmFromDistanceAndDuration,
} from '../../lib/time'

describe('time helpers', () => {
  it('calcula duração estimada da volta em horas e minutos', () => {
    expect(getEstimatedLapDuration({ distanceKm: 30, rhythmKmH: 15 })).toBe(
      '02h:00m',
    )
    expect(getEstimatedLapDuration({ distanceKm: 20, rhythmKmH: 18 })).toBe(
      '01h:07m',
    )
  })

  it('retorna null quando ritmo ou distância não foram informados', () => {
    expect(getEstimatedLapDuration({ distanceKm: 30, rhythmKmH: 0 })).toBeNull()
    expect(getEstimatedLapDuration({ distanceKm: 0, rhythmKmH: 18 })).toBeNull()
    expect(
      getEstimatedLapDuration({ distanceKm: 30, rhythmKmH: -5 }),
    ).toBeNull()
  })

  it('classifica hora inválida como noite', () => {
    expect(getPeriodFromHour('sem-hora')).toBe('night')
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

  it('deriva o ritmo a partir da distância e da duração', () => {
    expect(
      getRhythmFromDistanceAndDuration({
        distanceKm: 50,
        durationMinutes: 150,
      }),
    ).toBe(20)
    // arredonda em 1 casa decimal (50 / 3h = 16,666…)
    expect(
      getRhythmFromDistanceAndDuration({
        distanceKm: 50,
        durationMinutes: 180,
      }),
    ).toBe(16.7)
  })

  it('retorna null quando distância ou duração não permitem o cálculo', () => {
    expect(
      getRhythmFromDistanceAndDuration({ distanceKm: 0, durationMinutes: 60 }),
    ).toBeNull()
    expect(
      getRhythmFromDistanceAndDuration({ distanceKm: 50, durationMinutes: 0 }),
    ).toBeNull()
  })
})
