export default [
  {
    path: '/',
    name: 'home',
    component: () => import('./Home.vue')
  },
  {
    path: '/persist',
    name: 'persist',
    component: () => import('./Persist.vue')
  }
];
