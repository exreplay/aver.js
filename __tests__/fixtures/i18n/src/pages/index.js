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
  }
];
