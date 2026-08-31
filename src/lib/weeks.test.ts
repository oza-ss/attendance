import { describe, it, expect } from 'vitest'
import { getIsoWeek, getCurrentWeek, getWeekRange, weekLabel } from './weeks'

describe('ISO 周工具', () => {
  it('已知日期归属周', () => {
    expect(getIsoWeek('2026-08-25')).toEqual({ year: 2026, week: 35 }) // 周二
    expect(getIsoWeek('2026-01-01')).toEqual({ year: 2026, week: 1 })  // 周四
    expect(getIsoWeek('2025-12-29')).toEqual({ year: 2026, week: 1 })  // 周一，属 2026 第 1 周
  })

  it('getCurrentWeek 基于当前时间', () => {
    const now = new Date(2026, 7, 25, 12, 0)
    expect(getCurrentWeek(now)).toEqual({ year: 2026, week: 35 })
  })

  it('getWeekRange 返回周一~周日', () => {
    expect(getWeekRange(2026, 35)).toEqual({ start: '2026-08-24', end: '2026-08-30' })
    expect(getWeekRange(2026, 1)).toEqual({ start: '2025-12-29', end: '2026-01-04' })
    expect(getWeekRange(2027, 1)).toEqual({ start: '2027-01-04', end: '2027-01-10' })
  })

  it('weekLabel 展示', () => {
    expect(weekLabel(2026, 35)).toBe('2026 年第 35 周')
  })
})
