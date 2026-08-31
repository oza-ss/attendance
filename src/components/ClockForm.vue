<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { showConfirmDialog, showSuccessToast, showToast, showFailToast } from 'vant'
import { calculateDailyHours } from '../lib/workHours'
import { formatHoursDecimal } from '../lib/format'
import { useDailyRecordsStore } from '../stores/dailyRecords'

const props = defineProps<{ date: string }>()

const store = useDailyRecordsStore()
const saving = ref(false)

const start = ref('')
const end = ref('')

// 日期或打卡数据任一变化即同步表单（覆盖加载完成、切换日期、保存后刷新等场景）
watch(
  [() => props.date, () => store.records],
  () => {
    const r = store.byDate(props.date)
    start.value = r?.start_time ?? ''
    end.value = r?.end_time ?? ''
  },
  { immediate: true },
)

// 当天工时：只有上班+下班都填好才算，否则 0（不用当前时间/默认下班算）
const hours = computed(() => (start.value && end.value ? calculateDailyHours(start.value, end.value) : 0))

const showTime = ref(false)
const timeTab = ref(0)
const openKey = ref(0)
// PickerGroup 内的临时选中值（['HH','mm','ss']）
const startPick = ref<string[]>(['09', '00', '00'])
const endPick = ref<string[]>(['20', '30', '00'])

// 兼容旧数据存的是 'HH:mm'，补成三段
function toPicker(t: string): string[] {
  const p = t.split(':')
  while (p.length < 3) p.push('00')
  return p.slice(0, 3)
}

function openTime(tab: number) {
  startPick.value = toPicker(start.value || '09:00:00')
  endPick.value = toPicker(end.value || '20:30:00')
  timeTab.value = tab
  openKey.value++
  showTime.value = true
}

// PickerGroup 确认：结果数组 [上班 selectedValues, 下班 selectedValues]，只应用当前 tab 对应的时间
function onTimeConfirm(results: Array<{ selectedValues: string[] }>) {
  if (timeTab.value === 0) {
    start.value = results[0]?.selectedValues?.join(':') ?? start.value
  } else {
    end.value = results[1]?.selectedValues?.join(':') ?? end.value
  }
  showTime.value = false
}

// 清空当前 tab 对应的时间（上班或下班）并关闭
function clearCurrent() {
  if (timeTab.value === 0) start.value = ''
  else end.value = ''
  showTime.value = false
}

async function save() {
  if (!props.date) {
    showToast('请先选择日期')
    return
  }
  if (!start.value) {
    showToast('请选择上班时间')
    return
  }
  if (!end.value) {
    showToast('请选择下班时间')
    return
  }
  if (end.value && end.value < start.value) {
    try {
      await showConfirmDialog({
        title: '跨天提示',
        message: '下班时间早于上班时间，将按次日凌晨（跨天）计算，是否确认？',
      })
    } catch {
      return // 用户取消
    }
  }
  saving.value = true
  try {
    await store.save({ date: props.date, start_time: start.value, end_time: end.value })
    showSuccessToast('已保存')
  } catch (e: any) {
    showFailToast(e?.message ?? '保存失败，请重试')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <van-field :model-value="start" label="上班时间" readonly is-link @click="openTime(0)" placeholder="选择上班时间" />
  <van-field :model-value="end" label="下班时间" readonly is-link @click="openTime(1)" placeholder="选择下班时间" />
  <van-popup v-model:show="showTime" position="bottom" round>
    <van-picker-group
      :key="openKey"
      v-model:active-tab="timeTab"
      title="选择时间"
      :tabs="['上班时间', '下班时间']"
      cancel-button-text="清空"
      confirm-button-text="确认"
      @confirm="onTimeConfirm"
      @cancel="clearCurrent"
    >
      <van-time-picker v-model="startPick" :columns-type="['hour', 'minute', 'second']" />
      <van-time-picker v-model="endPick" :columns-type="['hour', 'minute', 'second']" />
    </van-picker-group>
  </van-popup>
  <van-cell title="当天工时" :value="`${formatHoursDecimal(hours)}h`" />
  <div style="padding: 12px">
    <van-button block type="primary" :loading="saving" @click="save">保存</van-button>
  </div>
</template>
