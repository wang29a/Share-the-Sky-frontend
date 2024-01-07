import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Home from '../views/Home.vue';
import Admin from '../views/Admin.vue';
import Share from '../views/Share.vue';
// import L1 from '../views/1.vue';
// import L2 from '../views/2.vue';
// import L3 from '../views/3.vue';
// import L4 from '../views/4.vue';
// import L5 from '../views/5.vue';

const routes = [
  {
    path: '/home',
    name: 'Home',
    component: Home,
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/sf',
    name: 'Share',
    component: Share,
  },
  // {
  //   path: '/l1',
  //   name: 'L1',
  //   component: L1,
  // },
  // {
  //   path: '/l2',
  //   name: 'L2',
  //   component: L2,
  // },
  // {
  //   path: '/l3',
  //   name: 'L3',
  //   component: L3,
  // },
  // {
  //   path: '/l4',
  //   name: 'L4',
  //   component: L4,
  // },
  // {
  //   path: '/l5',
  //   name: 'L5',
  //   component: L5,
  // },
  // { path: '/l6',
  //   name: 'L6',
  //   component: L6,
  // },
  // 你可以在这里添加更多的路由
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
