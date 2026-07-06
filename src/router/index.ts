import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

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
    path: '/accidents/:id',
    name: 'accident-detail',
    meta: { title: '事故类比排查详情', noSidebar: true },
    component: () => import('@/views/AccidentDetail.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.afterEach((to) => {
  document.title = `${to.meta.title || '后台管理'} - ${appTitle}`
})

export default router
