import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('../views/HomeView.vue') },
  { path: '/attendance', component: () => import('../views/AttendanceView.vue') },
  { path: '/summary', component: () => import('../views/SummaryView.vue') },
  { path: '/history', component: () => import('../views/HistoryView.vue') },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
