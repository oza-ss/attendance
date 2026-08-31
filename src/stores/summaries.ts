import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SummaryRecord } from '../lib/types'
import { getDataStore } from '../data/dataStore'

export const useSummariesStore = defineStore('summaries', () => {
  const list = ref<SummaryRecord[]>([])
  const error = ref('')

  async function load() {
    try {
      list.value = await (await getDataStore()).listSummaries()
      error.value = ''
    } catch (e: any) {
      error.value = e?.message ?? '数据加载失败'
    }
  }
  async function save(s: SummaryRecord) {
    await (await getDataStore()).saveSummary(s)
    await load()
  }
  async function remove(id: string) {
    await (await getDataStore()).deleteSummary(id)
    await load()
  }

  return { list, error, load, save, remove }
})
