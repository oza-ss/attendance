import { describe, it, expect } from 'vitest'
import { computeMonthStats, computeWeekStats } from './aggregate'
import type { DailyRecord, SummaryRecord } from './types'

const rec = (date: string, start_time: string, end_time: string | null = null): DailyRecord => ({ date, start_time, end_time })
const sum = (id: string, start_date: string, end_date: string, total_hours: number, work_days: number, created_at = '2026-08-01T00:00:00Z'): SummaryRecord => ({ id, start_date, end_date, total_hours, work_days, created_at })

describe('computeMonthStats 月统计', () => {
  it('纯打卡：8/3(8.5h) + 8/4(9.5h) + 8/5(5h)', () => {
    const records = [rec('2026-08-03', '07:00', '17:00'), rec('2026-08-04', '07:00', '18:30'), rec('2026-08-05', '07:00', '12:00')]
    const s = computeMonthStats('2026-08', records, [])
    expect(s.totalHours).toBe(23)
    expect(s.workDays).toBe(3)
    expect(s.avgHours).toBeCloseTo(7.67, 2)
    expect(s.clockWorkDays).toBe(3)
  })

  it('纯汇总：整月 160h / 20 天', () => {
    const s = computeMonthStats('2026-08', [], [sum('s1', '2026-08-01', '2026-08-31', 160, 20)])
    expect(s.totalHours).toBe(160)
    expect(s.workDays).toBe(20)
    expect(s.avgHours).toBe(8)
    expect(s.clockWorkDays).toBe(0)
  })

  it('混合：汇总覆盖 8/1-8/8(50h/5天)，打卡 8/10(8.5h) 8/11(7.5h)', () => {
    const records = [rec('2026-08-10', '07:00', '17:00'), rec('2026-08-11', '08:00', '17:00')]
    const s = computeMonthStats('2026-08', records, [sum('s1', '2026-08-01', '2026-08-08', 50, 5)])
    expect(s.totalHours).toBe(66)
    expect(s.workDays).toBe(7)
    expect(s.avgHours).toBeCloseTo(9.43, 2)
  })

  it('跨月汇总归入结束日所在月（8/28-9/3 不算 8 月）', () => {
    const records = [rec('2026-08-28', '07:00', '17:00')]
    const s = computeMonthStats('2026-08', records, [sum('s1', '2026-08-28', '2026-09-03', 45, 5)])
    expect(s.totalHours).toBe(8.5)
    expect(s.workDays).toBe(1)
  })

  it('整月汇总与周汇总并存时以整月汇总为唯一权威，避免双计', () => {
    const s = computeMonthStats('2026-08', [], [
      sum('m1', '2026-08-01', '2026-08-31', 160, 20),
      sum('w1', '2026-08-24', '2026-08-28', 40, 5),
    ])
    expect(s.totalHours).toBe(160)
    expect(s.workDays).toBe(20)
    expect(s.clockWorkDays).toBe(0)
  })

  it('整月汇总覆盖月内打卡与周汇总：打卡日归零', () => {
    const records = [rec('2026-08-10', '07:00', '17:00')]
    const s = computeMonthStats('2026-08', records, [
      sum('m1', '2026-08-01', '2026-08-31', 160, 20),
      sum('w1', '2026-08-24', '2026-08-28', 40, 5),
    ])
    expect(s.totalHours).toBe(160)
    expect(s.workDays).toBe(20)
    expect(s.clockWorkDays).toBe(0)
    expect(s.clockTotalHours).toBe(0)
  })
})

describe('computeWeekStats 周统计', () => {
  it('纯打卡：2026-W35（8/24-8/30）', () => {
    const records = [rec('2026-08-24', '07:00', '17:00'), rec('2026-08-25', '07:00', '18:30')]
    const s = computeWeekStats(2026, 35, records, [])
    expect(s.startDate).toBe('2026-08-24')
    expect(s.endDate).toBe('2026-08-30')
    expect(s.totalHours).toBe(18)
    expect(s.workDays).toBe(2)
    expect(s.avgHours).toBe(9)
  })

  it('周被汇总覆盖时用汇总值', () => {
    const records = [rec('2026-08-24', '07:00', '17:00')]
    const s = computeWeekStats(2026, 35, records, [sum('s1', '2026-08-24', '2026-08-28', 40, 5)])
    expect(s.totalHours).toBe(40)
    expect(s.workDays).toBe(5)
    expect(s.avgHours).toBe(8)
  })

  it('周被整月汇总覆盖时排除整月汇总，回退到打卡', () => {
    const records = [rec('2026-08-24', '07:00', '17:00'), rec('2026-08-25', '07:00', '18:30')]
    const s = computeWeekStats(2026, 35, records, [sum('m1', '2026-08-01', '2026-08-31', 160, 20)])
    expect(s.totalHours).toBe(18)
    expect(s.workDays).toBe(2)
    expect(s.avgHours).toBe(9)
  })
})
