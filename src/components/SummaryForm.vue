<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { showSuccessToast, showToast, showFailToast } from 'vant'
import dayjs from 'dayjs'
import { useSummariesStore } from '../stores/summaries'
import { useNow } from '../composables/useNow'
import { formatHoursDecimal } from '../lib/format'
import { toDateStr } from '../lib/time'
import type { SummaryRecord } from '../lib/types'

const emit = defineEmits<{ (e: 'saved'): void }>()
const props = defineProps<{ initial?: SummaryRecord | null }>()

const store = useSummariesStore()
const { now } = useNow()

// 日期区间默认为空，不预选当前周（编辑时才有值）
const startDate = ref(props.initial?.start_date ?? '')
const endDate = ref(props.initial?.end_date ?? '')
const totalHours = ref(props.initial ? String(props.initial.total_hours) : '')
const workDays = ref(props.initial ? String(props.initial.work_days) : '')
const note = ref(props.initial?.note ?? '')

// 编辑时 props.initial 变为目标记录 → 回填表单；清空(保存后) → 重置为空
watch(
  () => props.initial,
  (r) => {
    startDate.value = r?.start_date ?? ''
    endDate.value = r?.end_date ?? ''
    totalHours.value = r ? String(r.total_hours) : ''
    workDays.value = r ? String(r.work_days) : ''
    note.value = r?.note ?? ''
  },
  { immediate: true },
)

const avg = computed(() => {
  const t = Number(totalHours.value)
  const w = Number(workDays.value)
  return w > 0 ? t / w : 0
})

// 日期区间：Vant Calendar 范围选择（不限范围）
const showRange = ref(false)
const minDate = new Date(2000, 0, 1)
const maxDate = new Date(2040, 11, 31)

function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
// 打开日历时的默认区间（未选则定位到本周）
const defaultRange = computed<[Date, Date]>(() => {
  if (startDate.value && endDate.value) return [parseDate(startDate.value), parseDate(endDate.value)]
  const today = dayjs(now.value)
  const mon = today.startOf('week').add(1, 'day') // 周一
  return [mon.toDate(), mon.add(6, 'day').toDate()]
})

function onRangeConfirm(date: Date[]) {
  const [s, e] = date
  startDate.value = toDateStr(s)
  endDate.value = toDateStr(e)
  showRange.value = false
}

async function save() {
  if (!startDate.value || !endDate.value) {
    showToast('请选择日期区间')
    return
  }
  if (endDate.value < startDate.value) {
    showToast('区间结束日期不能早于起始日期')
    return
  }
  if (String(totalHours.value).trim() === '' || String(workDays.value).trim() === '') {
    showToast('请填写总工时与工作天数')
    return
  }
  const totalH = Number(totalHours.value)
  const workD = Number(workDays.value)
  if (totalH < 0 || workD < 0) {
    showToast('工时与天数不能为负')
    return
  }
  const id = props.initial?.id ?? crypto.randomUUID()
  try {
    await store.save({
      id,
      start_date: startDate.value,
      end_date: endDate.value,
      total_hours: Math.round(totalH * 100) / 100,
      work_days: Math.round(workD),
      note: note.value || undefined,
      created_at: props.initial?.created_at ?? new Date().toISOString(),
    })
    showSuccessToast('已保存')
    emit('saved')
  } catch {
    showFailToast('保存失败，请重试')
  }
}
</script>

<template>
  <van-cell-group inset>
    <van-field :model-value="startDate && endDate ? `${startDate} ~ ${endDate}` : ''" label="日期区间" placeholder="请选择日期区间" readonly is-link @click="showRange = true" />
    <van-calendar
      v-model:show="showRange"
      type="range"
      :show-title="false"
      :show-confirm="true"
      :default-date="defaultRange"
      :min-date="minDate"
      :max-date="maxDate"
      :first-day-of-week="1"
      @confirm="onRangeConfirm"
    />

    <van-field v-model="totalHours" type="number" label="总工时" placeholder="如 45" />
    <van-field v-model="workDays" type="number" label="工作天数" placeholder="如 5" />
    <van-cell title="平均工时" :value="`${formatHoursDecimal(avg)} 小时/天`" />
    <van-field v-model="note" label="备注" placeholder="如：公司周报 2026-35 周" />
    <div style="padding: 12px">
      <van-button block type="primary" @click="save">{{ props.initial ? '更新' : '保存' }}</van-button>
    </div>
  </van-cell-group>
</template>
