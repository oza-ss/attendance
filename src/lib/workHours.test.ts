import { describe, it, expect } from 'vitest'
import { calculateDailyHours } from './workHours'

describe('calculateDailyHours 单日工时', () => {
  it('常规：07:00-12:30', () => {
    expect(calculateDailyHours('07:00', '12:30')).toBe(5.5)
  })
  it('跨午休：07:00-14:00 扣 1.5h', () => {
    expect(calculateDailyHours('07:00', '14:00')).toBe(5.5)
  })
  it('07:00-18:00 扣午休不扣晚休', () => {
    expect(calculateDailyHours('07:00', '18:00')).toBe(9.5)
  })
  it('07:00-18:30 扣午休+晚休', () => {
    expect(calculateDailyHours('07:00', '18:30')).toBe(9.5)
  })
  it('18:30 后加班计入：07:00-19:00', () => {
    expect(calculateDailyHours('07:00', '19:00')).toBe(10)
  })
  it('7:00 前上班从 7:00 起算', () => {
    expect(calculateDailyHours('06:50', '12:00')).toBe(5)
  })
  it('未下班(end=null) 用 now 时刻实时计算', () => {
    const now = new Date(2026, 7, 25, 12, 0)
    expect(calculateDailyHours('07:00', null, now)).toBe(5)
  })
  it('跨午夜：07:00 -> 次日 02:00', () => {
    expect(calculateDailyHours('07:00', '02:00')).toBe(17)
  })
  it('次日 5:00 封顶：07:00 -> 次日 06:30 按 5:00 算', () => {
    expect(calculateDailyHours('07:00', '06:30')).toBe(20)
  })
  it('次日凌晨下班：14:00 -> 次日 05:00', () => {
    expect(calculateDailyHours('14:00', '05:00')).toBe(14.5)
  })
  it('未下班且 now 已跨次日凌晨', () => {
    const now = new Date(2026, 7, 26, 6, 0)
    expect(calculateDailyHours('07:00', null, now)).toBe(20)
  })
  it('上下班相同返回 0', () => {
    expect(calculateDailyHours('07:00', '07:00')).toBe(0)
  })

  it('支持秒精度：07:00:30-12:30:00', () => {
    expect(calculateDailyHours('07:00:00', '12:30:00')).toBe(5.5)
    // 07:00:30 起算（420.5 分），12:30:00（750 分），差 329.5 分且未入午休 → 329.5/60 ≈ 5.49
    expect(calculateDailyHours('07:00:30', '12:30:00')).toBe(5.49)
  })
})
