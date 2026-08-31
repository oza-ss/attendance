<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { showConfirmDialog, showFailToast } from 'vant'
import { useSummariesStore } from '../stores/summaries'
import { formatHoursDecimal } from '../lib/format'
import SummaryForm from '../components/SummaryForm.vue'

const store = useSummariesStore()
const route = useRoute()
const editing = ref<string | null>(null)

onMounted(() => store.load())

// 支持 ?edit=<id> 从手工录入记录页跳转过来编辑指定记录
watch(
  () => route.query.edit as string | undefined,
  (id) => {
    editing.value = id ?? null
  },
  { immediate: true },
)

const editingRecord = () => (editing.value ? store.list.find((s) => s.id === editing.value) ?? null : null)

// 最近 15 条手工录入记录（按开始日期降序）
const recent = computed(() =>
  [...store.list].sort((a, b) => b.start_date.localeCompare(a.start_date)).slice(0, 15),
)

// 删除某条手工录入记录
async function removeRecord(id: string) {
  try {
    await showConfirmDialog({ title: '删除', message: '删除这条手工录入记录？' })
  } catch {
    return // 用户取消
  }
  try {
    await store.remove(id)
  } catch (e: any) {
    showFailToast(e?.message ?? '删除失败，请重试')
  }
}
</script>

<template>
  <div>
    <SummaryForm :initial="editingRecord()" @saved="editing = null" />

    <van-cell-group inset style="margin-top: 12px">
      <template v-for="s in recent" :key="s.id">
        <van-cell
          :title="`${s.start_date} ~ ${s.end_date}`"
          :label="`${s.total_hours}h / ${s.work_days} 天 · 平均 ${formatHoursDecimal(s.work_days > 0 ? s.total_hours / s.work_days : 0)}h · ${s.note ?? ''}`"
          is-link
          @click="editing = s.id"
        >
          <template #right-icon>
            <van-icon name="delete-o" size="18" color="#ee0a24" style="margin-left: 8px" @click.stop="removeRecord(s.id)" />
          </template>
        </van-cell>
      </template>
      <van-cell v-if="!recent.length" title="暂无录入记录" />
    </van-cell-group>
  </div>
</template>
