import { createRouter, createWebHashHistory } from 'vue-router';

import Popup from '../popup/view/popup.vue';
import type { RouteRecordRaw } from 'vue-router';
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: Popup,
  },
  {
    path: '/libs/views/popup.html',
    name: 'popup',
    component: Popup,
  },
];

export const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
});
