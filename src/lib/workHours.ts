// 单日工时计算纯函数：按 7:00 起算、扣除午休/晚休、支持跨午夜与次日 5:00 封顶
import { toMinutes, nowTime } from './time'

// 起算时刻 07:00（7:00 前上班从 7:00 起算）
export const START_CAP_MIN = 7 * 60
// 午休 12:30-14:00
export const LUNCH: [number, number] = [12 * 60 + 30, 14 * 60]
// 晚休 18:00-18:30
export const DINNER: [number, number] = [18 * 60, 18 * 60 + 30]
// 次日 05:00 封顶（跨午夜加班最多算到次日 5:00）
export const NEXT_DAY_CAP_MIN = 24 * 60 + 5 * 60

export function calculateDailyHours(start: string, end: string | null, now: Date = new Date()): number {
  const startMin = toMinutes(start)
  // 未下班(end=null) 时用 now 时刻实时计算
  let endMin = end ? toMinutes(end) : toMinutes(nowTime(now))
  if (endMin < startMin) endMin += 24 * 60 // 跨午夜：end 早于 start 视为次日
  endMin = Math.min(endMin, NEXT_DAY_CAP_MIN) // 次日 5:00 封顶
  const effStart = Math.max(startMin, START_CAP_MIN)
  if (endMin <= effStart) return 0
  let total = endMin - effStart
  // 扣除与休息区间 [12:30,14:00] / [18:00,18:30] 的重叠部分
  for (const [bs, be] of [LUNCH, DINNER]) {
    const overlap = Math.min(endMin, be) - Math.max(effStart, bs)
    if (overlap > 0) total -= overlap
  }
  // 分钟转小时并四舍五入到两位小数，避免浮点误差
  return Math.round((total / 60) * 100) / 100
}
