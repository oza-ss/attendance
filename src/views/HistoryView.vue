<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { showToast, showConfirmDialog, showFailToast } from 'vant'
import { useRouter } from 'vue-router'
import { useDailyRecordsStore } from '../stores/dailyRecords'
import { useSummariesStore } from '../stores/summaries'
import { useCalendarStore } from '../stores/calendar'
import { computeMonthStats } from '../lib/aggregate'
import { formatHoursDecimal } from '../lib/format'
import { monthWorkDays } from '../lib/calendar'
import { HOLIDAY_NAMES } from '../lib/holidays'
import { toDateStr } from '../lib/time'
import { calculateDailyHours } from '../lib/workHours'

import type { CalendarDayItem } from 'vant'

const daily = useDailyRecordsStore()
const summaries = useSummariesStore()
const calendar = useCalendarStore()
const router = useRouter()

// 当前显示的月份（默认本月，一号）
const displayDate = ref(dayjs().startOf('month').toDate())
// Collapse 展开状态
const activeNames = ref<string[]>([])

onMounted(() => {
  daily.load()
  summaries.load()
  calendar.load()
})

const displayMonth = computed(() => dayjs(displayDate.value).format('YYYY-MM'))
const workDays = computed(() => {
  const [y, m] = displayMonth.value.split('-').map(Number)
  return monthWorkDays(y, m, calendar.list)
})
const stats = computed(() => computeMonthStats(displayMonth.value, daily.records, summaries.list))

// 当月打卡记录（降序）
const monthClocks = computed(() =>
  daily.records
    .filter((r) => r.date.startsWith(displayMonth.value))
    .sort((a, b) => b.date.localeCompare(a.date)),
)
// 当月手工录入（降序）
const monthEntries = computed(() =>
  summaries.list
    .filter((s) => s.end_date.startsWith(displayMonth.value))
    .sort((a, b) => b.start_date.localeCompare(a.start_date)),
)

// 切换年月时同步标题
function onPanelChange({ date }: { date: Date }) {
  displayDate.value = dayjs(date).startOf('month').toDate()
}

// 标记非工作日为"休"：法定节假日红色、周末灰色
function formatter(item: CalendarDayItem) {
  const d = item.date ? toDateStr(item.date) : ''
  if (!d || item.type === 'placeholder') return item
  const holiday = HOLIDAY_NAMES[d]
  const weekend = [0, 6].includes(dayjs(d).day())
  if (holiday || weekend) {
    item.topInfo = '休'
    item.className = holiday ? 'holiday-mark' : 'weekend-mark'
  }
  return item
}

// 点击某天：若是法定节假日，显示假期名
function onSelect(date: Date) {
  const d = toDateStr(date)
  const holiday = HOLIDAY_NAMES[d]
  if (holiday) {
    showToast(`${d} · ${holiday}`)
  }
}

// 打卡记录：跳转打卡页编辑
function goClockEdit(date: string) {
  router.push({ path: '/attendance', query: { date } })
}
// 手工录入：跳转录入页编辑
function goEntryEdit(id: string) {
  router.push({ path: '/summary', query: { edit: id } })
}

// 删除打卡记录
async function removeClock(date: string) {
  try {
    await showConfirmDialog({ title: '删除', message: `删除 ${date} 的打卡记录？` })
  } catch {
    return
  }
  try {
    await daily.remove(date)
  } catch (e: any) {
    showFailToast(e?.message ?? '删除失败，请重试')
  }
}
// 删除手工录入
async function removeEntry(id: string) {
  try {
    await showConfirmDialog({ title: '删除', message: '删除这条手工录入记录？' })
  } catch {
    return
  }
  try {
    await summaries.remove(id)
  } catch (e: any) {
    showFailToast(e?.message ?? '删除失败，请重试')
  }
}
</script>

<template>
  <div>
    <van-cell-group inset>
      <van-calendar
        :poppable="false"
        type="single"
        :show-title="false"
        :show-confirm="false"
        :show-subtitle="true"
        :default-date="displayDate"
        :switch-mode="'year-month'"
        :formatter="formatter"
        :first-day-of-week="1"
        @select="onSelect"
        @panel-change="onPanelChange"
      />
    </van-cell-group>

    <van-cell-group inset style="margin-top: 12px">
      <van-cell title="工作天数" :value="`${stats.workDays} / ${workDays} 天`" />
      <van-cell title="总工时" :value="`${formatHoursDecimal(stats.totalHours)} 小时`" />
      <van-cell title="平均工时" :value="`${formatHoursDecimal(stats.avgHours)} 小时/天`" />
    </van-cell-group>

    <van-cell-group inset style="margin-top: 12px">
      <van-collapse v-model="activeNames">
        <van-collapse-item title="打卡记录" :name="'clock'" :value="`${formatHoursDecimal(stats.clockTotalHours)} 小时 / ${stats.clockWorkDays} 天`">
          <template v-for="r in monthClocks" :key="r.date">
            <van-cell
              :title="r.date"
              :label="`${r.start_time} ~ ${r.end_time} · 共 ${formatHoursDecimal(calculateDailyHours(r.start_time, r.end_time))}h`"
              is-link
              @click="goClockEdit(r.date)"
            >
              <template #right-icon>
                <van-icon name="delete-o" size="18" color="#ee0a24" style="margin-left: 8px" @click.stop="removeClock(r.date)" />
              </template>
            </van-cell>
          </template>
          <van-empty v-if="!monthClocks.length" description="本月暂无打卡记录" image-size="60" />
        </van-collapse-item>

        <van-collapse-item title="手工录入" :name="'entry'" :value="`${formatHoursDecimal(stats.summaryTotalHours)} 小时 / ${stats.summaryWorkDays} 天`">
          <template v-for="s in monthEntries" :key="s.id">
            <van-cell
              :title="`${s.start_date} ~ ${s.end_date}`"
              :label="`${s.total_hours}h / ${s.work_days} 天 · 平均 ${formatHoursDecimal(s.work_days > 0 ? s.total_hours / s.work_days : 0)}h · ${s.note ?? ''}`"
              is-link
              @click="goEntryEdit(s.id)"
            >
              <template #right-icon>
                <van-icon name="delete-o" size="18" color="#ee0a24" style="margin-left: 8px" @click.stop="removeEntry(s.id)" />
              </template>
            </van-cell>
          </template>
          <van-empty v-if="!monthEntries.length" description="本月暂无手工录入" image-size="60" />
        </van-collapse-item>
      </van-collapse>
    </van-cell-group>
  </div>
</template>

<style scoped>
:deep(.van-calendar__top-info) {
  font-size: 10px;
}
:deep(.holiday-mark .van-calendar__top-info) {
  color: #ee0a24;
}
:deep(.weekend-mark .van-calendar__top-info) {
  color: #969799;
}
</style>
