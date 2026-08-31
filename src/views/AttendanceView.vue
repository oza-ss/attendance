<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { useRoute } from 'vue-router'
import { showConfirmDialog, showFailToast } from 'vant'
import { useNow } from '../composables/useNow'
import { useDailyRecordsStore } from '../stores/dailyRecords'
import { toDateStr } from '../lib/time'
import { calculateDailyHours } from '../lib/workHours'
import { formatHoursDecimal } from '../lib/format'
import ClockForm from '../components/ClockForm.vue'

const daily = useDailyRecordsStore()
const route = useRoute()
const { now } = useNow()
// 日期默认为空，不预选（?date=YYYY-MM-DD 直达编辑时除外）
const date = ref((route.query.date as string) || '')
const showCal = ref(false)

onMounted(() => daily.load())

// 日历选择：返回单个 Date
function onDateSelect(d: Date) {
  date.value = toDateStr(d)
  showCal.value = false
}

// 最近 15 条打卡记录（日期降序）
const recent = computed(() =>
  [...daily.records].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 15),
)

// 点击某条：载入上方表单编辑
function goEdit(d: string) {
  date.value = d
}

// 删除某条打卡记录
async function removeRecord(d: string) {
  try {
    await showConfirmDialog({ title: '删除', message: `删除 ${d} 的打卡记录？` })
  } catch {
    return // 用户取消
  }
  try {
    await daily.remove(d)
  } catch (e: any) {
    showFailToast(e?.message ?? '删除失败，请重试')
  }
}
</script>

<template>
  <div>
    <van-cell-group inset>
      <van-field :model-value="date" label="日期" placeholder="请选择日期" readonly is-link @click="showCal = true" />
      <van-calendar
        v-model:show="showCal"
        type="single"
        :show-title="false"
        :default-date="dayjs(now).toDate()"
        :min-date="new Date(2000, 0, 1)"
        :max-date="new Date(2040, 11, 31)"
        :switch-mode="'year-month'"
        :first-day-of-week="1"
        @confirm="onDateSelect"
      />
      <ClockForm :date="date" />
    </van-cell-group>

    <van-cell-group inset style="margin-top: 12px">
      <template v-for="r in recent" :key="r.date">
        <van-cell
          :title="r.date"
          :label="`${r.start_time} ~ ${r.end_time} · 共 ${formatHoursDecimal(calculateDailyHours(r.start_time, r.end_time))}h`"
          is-link
          @click="goEdit(r.date)"
        >
          <template #right-icon>
            <van-icon name="delete-o" size="18" color="#ee0a24" style="margin-left: 8px" @click.stop="removeRecord(r.date)" />
          </template>
        </van-cell>
      </template>
      <van-cell v-if="!recent.length" title="暂无打卡记录" />
    </van-cell-group>
  </div>
</template>
