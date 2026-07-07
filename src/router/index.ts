import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { accidents } from '@/data/accidents'

const appTitle = import.meta.env.VITE_APP_TITLE || '溧水区城市安全电子一张图'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/accidents',
  },
  {
    path: '/accidents',
    name: 'accidents',
    meta: { title: '事故类比排查防控' },
    component: () => import('@/views/AccidentList.vue'),
  },
  {
    path: '/accidents/:fileId',
    name: 'accident-detail',
    meta: { title: '事故类比排查详情', noSidebar: true },
    component: () => import('@/views/AccidentDetail.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to) => {
  if (to.name !== 'accident-detail') return true

  const fileId = String(to.params.fileId || '')
  if (accidents.some((item) => item.fileId === fileId)) return true

  return { name: 'accidents' }
})

router.afterEach((to) => {
  document.title = `${to.meta.title || '后台管理'} - ${appTitle}`
})

export default router
