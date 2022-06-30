import { createRouter, createWebHashHistory } from 'vue-router';
import devtool from '../devtool/view/devtool.vue';
import type { RouteRecordRaw } from 'vue-router';
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: devtool,
  },
  {
    path: '/libs/views/devtoolView.html',
    name: 'devtool',
    component: devtool,
  },
];

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
});

export default router;
