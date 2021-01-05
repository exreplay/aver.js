export default [
  {
    path: '/',
    name: 'home',
    component: () => import('./home.vue')
  },
  {
    path: '/postcss',
    name: 'postcss',
    component: () => import('./postcss.vue')
  },
  {
    path: '/cssinjs',
    name: 'cssinjs',
    component: () => import('./cssinjs.vue')
  }
  // {
  //   path: '/scss',
  //   name: 'scss',
  //   component: () => import('./scss.vue')
  // }
];
