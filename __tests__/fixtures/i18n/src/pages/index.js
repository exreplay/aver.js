export default [
  {
    path: '/',
    name: 'home',
    component: () => import('./Home')
  },
  {
    path: '/fallback',
    name: 'fallback',
    component: () => import('./Fallback')
  },
  {
    path: '/global',
    name: 'global',
    component: () => import('./Global')
  }
];
