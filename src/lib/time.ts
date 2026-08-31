// 时间工具：'HH:mm[:ss]' 字符串与分钟数互转，日期 'YYYY-MM-DD' 序列化

export function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/** 解析 'HH:mm' 或 'HH:mm:ss'，返回分钟数（含秒的小数部分，如 07:00:30 -> 420.5） */
export function toMinutes(hhmmss: string): number {
  const parts = hhmmss.split(':')
  if (parts.length !== 2 && parts.length !== 3) throw new Error(`非法时间: ${hhmmss}`)
  const h = Number(parts[0])
  const m = Number(parts[1])
  const s = parts.length === 3 ? Number(parts[2]) : 0
  if (
    parts.some((p) => p === '') ||
    Number.isNaN(h) ||
    Number.isNaN(m) ||
    Number.isNaN(s) ||
    h < 0 ||
    h > 24 ||
    m < 0 ||
    m > 59 ||
    s < 0 ||
    s > 59
  ) {
    throw new Error(`非法时间: ${hhmmss}`)
  }
  return h * 60 + m + s / 60
}

export function formatMinutes(min: number): string {
  const total = Math.round(min)
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${pad(h)}:${pad(m)}`
}

/** 当前时刻 'HH:mm:ss'（含秒，供实时计算使用） */
export function nowTime(now: Date = new Date()): string {
  return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

export function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
