import { describe, it, expect } from 'vitest'
import { formatHours, formatHoursDecimal } from './format'

describe('format 工具', () => {
  it('formatHours 转为 小时+分钟', () => {
    expect(formatHours(8.5)).toBe('8小时30分')
    expect(formatHours(9)).toBe('9小时')
    expect(formatHours(0)).toBe('0小时')
  })

  it('formatHoursDecimal 保留小数并去尾零', () => {
    expect(formatHoursDecimal(8.571)).toBe('8.57')
    expect(formatHoursDecimal(9)).toBe('9')
  })

  it('无穷大显示占位', () => {
    expect(formatHours(Infinity)).toBe('—')
    expect(formatHoursDecimal(Infinity)).toBe('—')
  })
})
