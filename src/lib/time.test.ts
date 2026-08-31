import { describe, it, expect } from 'vitest'
import { toMinutes, formatMinutes, nowTime, pad, toDateStr } from './time'

describe('time 工具', () => {
  it('toMinutes 解析 HH:mm', () => {
    expect(toMinutes('07:00')).toBe(420)
    expect(toMinutes('12:30')).toBe(750)
    expect(toMinutes('00:05')).toBe(5)
  })

  it('toMinutes 支持秒（HH:mm:ss，返回含秒的分钟数）', () => {
    expect(toMinutes('07:00:30')).toBe(420.5)
    expect(toMinutes('12:30:45')).toBe(750.75)
    expect(toMinutes('08:00:00')).toBe(480)
  })

  it('toMinutes 对非法输入抛错', () => {
    expect(() => toMinutes('25:00')).toThrow()
    expect(() => toMinutes('7:')).toThrow()
    expect(() => toMinutes('07:00:60')).toThrow()
    expect(() => toMinutes('07:60:00')).toThrow()
    expect(() => toMinutes('07:00:99')).toThrow()
  })

  it('formatMinutes 双向还原', () => {
    expect(formatMinutes(420)).toBe('07:00')
    expect(formatMinutes(750)).toBe('12:30')
    expect(formatMinutes(0)).toBe('00:00')
    expect(toMinutes(formatMinutes(1439))).toBe(1439)
  })

  it('nowTime 取当前 HH:mm:ss（含秒）', () => {
    const d = new Date(2026, 7, 25, 8, 5, 30) // 2026-08-25 08:05:30
    expect(nowTime(d)).toBe('08:05:30')
    expect(nowTime(new Date(2026, 7, 25, 8, 5))).toBe('08:05:00')
  })

  it('pad / toDateStr 补零', () => {
    expect(pad(5)).toBe('05')
    expect(toDateStr(new Date(2026, 0, 3))).toBe('2026-01-03')
  })
})
