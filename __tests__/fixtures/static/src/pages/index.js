export default [
  {
    path: '/',
    name: 'home',
    component: () => import('./Home')
  },
  {
    path: '/test',
    name: 'test',
    component: () => import('./Test')
  },
  {
    path: '/meta',
    name: 'meta',
    component: () => import('./Meta')
  }
];
