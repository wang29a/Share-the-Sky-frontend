import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Home from '../views/Home.vue';
import L1 from '../views/1.vue';
import L2 from '../views/2.vue';
import L3 from '../views/3.vue';
import L4 from '../views/4.vue';

const routes = [
  {
    path: '/home',
    name: 'Home',
    component: Home,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/l1',
    name: 'L1',
    component: L1,
  },
  {
    path: '/l2',
    name: 'L2',
    component: L2,
  },
  {
    path: '/l4',
    name: 'L4',
    component: L4,
  },
  // 你可以在这里添加更多的路由
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
