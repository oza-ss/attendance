<script setup lang="ts">
import { ref, onMounted } from 'vue'

const password = import.meta.env.VITE_ACCESS_PASSWORD as string | undefined
const unlocked = ref(false)

onMounted(() => {
  unlocked.value = !password || sessionStorage.getItem('at:unlocked') === '1'
})

function unlock() {
  if (!password) return
  if (input.value === password) {
    sessionStorage.setItem('at:unlocked', '1')
    unlocked.value = true
    input.value = ''
  } else {
    error.value = '密码错误'
  }
}

const input = ref('')
const error = ref('')
</script>

<template>
  <div v-if="!unlocked" class="gate">
    <div class="gate-box">
      <h3>工时记录</h3>
      <van-field v-model="input" type="password" placeholder="请输入访问密码" @keyup.enter="unlock" />
      <van-button block type="primary" style="margin-top: 12px" @click="unlock">进入</van-button>
      <p v-if="error" style="color: #ee0a24">{{ error }}</p>
    </div>
  </div>
  <template v-else>
    <div class="page">
      <router-view />
    </div>
    <van-tabbar route>
      <van-tabbar-item replace to="/" icon="home-o">总览</van-tabbar-item>
      <van-tabbar-item replace to="/attendance" icon="clock-o">打卡</van-tabbar-item>
      <van-tabbar-item replace to="/summary" icon="edit">录入</van-tabbar-item>
      <van-tabbar-item replace to="/history" icon="bar-chart-o">历史</van-tabbar-item>
    </van-tabbar>
  </template>
</template>

<style scoped>
.gate {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.gate-box {
  width: 80%;
  max-width: 320px;
  text-align: center;
}
</style>
