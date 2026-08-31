// 格式化工具：小时数展示为「x小时y分」或保留两位小数的字符串

export function formatHours(h: number): string {
  if (!Number.isFinite(h)) return '—'
  const totalMin = Math.round(h * 60)
  const hh = Math.floor(totalMin / 60)
  const mm = totalMin % 60
  return mm === 0 ? `${hh}小时` : `${hh}小时${mm}分`
}

export function formatHoursDecimal(h: number): string {
  if (!Number.isFinite(h)) return '—'
  return h.toFixed(2).replace(/\.?0+$/, '')
}
