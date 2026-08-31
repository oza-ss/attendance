// 推演逻辑 computeForecast 测试
import { describe, it, expect } from 'vitest'
import { computeForecast } from './forecast'
import type { DailyRecord, SummaryRecord, CalendarOverride } from './types'

const rec = (date: string, start_time: string, end_time: string): DailyRecord => ({ date, start_time, end_time })
const sum = (id: string, start_date: string, end_date: string, total_hours: number, work_days: number): SummaryRecord => ({ id, start_date, end_date, total_hours, work_days, created_at: '2026-01-01T00:00:00Z' })
const allWorkdays = (_month: string): CalendarOverride[] => {
  // 2026-01 全部 31 天标为工作日
  return Array.from({ length: 31 }, (_, i) => ({ date: `2026-01-${String(i + 1).padStart(2, '0')}`, is_workday: true }))
}
// 仅将指定日号标为工作日，其余全部标为非工作日（覆盖默认周一~五，保证 T 恰为指定天数）
const onlyWorkdays = (days: number[]): CalendarOverride[] => {
  const set = new Set(days)
  return Array.from({ length: 31 }, (_, i) => ({ date: `2026-01-${String(i + 1).padStart(2, '0')}`, is_workday: set.has(i + 1) }))
}

describe('computeForecast 推演', () => {
  it('on-track：全月 31 个工作日，打卡 13 天共 123.5h', () => {
    const records = Array.from({ length: 13 }, (_, i) => rec(`2026-01-${String(i + 1).padStart(2, '0')}`, '07:00', '18:00')) // 每天 9.5h
    const f = computeForecast('2026-01', records, [], allWorkdays('2026-01'))
    expect(f.monthWorkDays).toBe(31)
    expect(f.workedDays).toBe(13)
    expect(f.targetTotalHours).toBe(279)
    expect(f.currentTotalHours).toBe(123.5)
    expect(f.remainingDays).toBe(18)
    expect(f.status).toBe('on-track')
  })

  it('achieved：目标已达成，perDay 为 0', () => {
    const records = Array.from({ length: 10 }, (_, i) => rec(`2026-01-${String(i + 1).padStart(2, '0')}`, '07:00', '18:00')) // 95h
    const ov = onlyWorkdays([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) // 本月仅 10 个工作日
    const f = computeForecast('2026-01', records, [], ov)
    expect(f.monthWorkDays).toBe(10)
    expect(f.targetTotalHours).toBe(90)
    expect(f.currentTotalHours).toBe(95)
    expect(f.neededTotalHours).toBe(0)
    expect(f.perDayHours).toBe(0)
    expect(f.status).toBe('achieved')
  })

  it('missed：剩余天数为 0 且未达标，perDay 为 Infinity', () => {
    const records = Array.from({ length: 5 }, (_, i) => rec(`2026-01-${String(i + 1).padStart(2, '0')}`, '07:00', '15:00')) // 每天 6.5h（扣午休 1.5h）= 32.5h
    const ov = onlyWorkdays([1, 2, 3, 4, 5]) // 本月仅 5 个工作日
    const f = computeForecast('2026-01', records, [], ov)
    expect(f.monthWorkDays).toBe(5)
    expect(f.targetTotalHours).toBe(45)
    expect(f.currentTotalHours).toBe(32.5)
    expect(f.remainingDays).toBe(0)
    expect(f.perDayHours).toBe(Infinity)
    expect(f.status).toBe('missed')
  })

  it('hard：单日所需超过 12h', () => {
    // 全月 31 个工作日，已工作 30 天共 255h（8.5h/天）→ 剩 1 天还需 24h > 12h → hard
    const records = Array.from({ length: 30 }, (_, i) => rec(`2026-01-${String(i + 1).padStart(2, '0')}`, '07:00', '17:00'))
    const f = computeForecast('2026-01', records, [], allWorkdays('2026-01'))
    expect(f.monthWorkDays).toBe(31)
    expect(f.remainingDays).toBe(1)
    expect(f.neededTotalHours).toBe(24)
    expect(f.perDayHours).toBe(24)
    expect(f.status).toBe('hard')
  })

  it('整月汇总提供 T（work_days）', () => {
    const summaries = [sum('s1', '2026-01-01', '2026-01-31', 150, 20)]
    const f = computeForecast('2026-01', [], summaries, [])
    expect(f.monthWorkDays).toBe(20)
    expect(f.targetTotalHours).toBe(180)
    expect(f.currentTotalHours).toBe(150)
    expect(f.remainingDays).toBe(0)
    expect(f.status).toBe('missed')
  })
})
