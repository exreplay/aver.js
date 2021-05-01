export default [
  {
    name: 'home',
    path: '/',
    component: () => import('./Home').then(m => m.default)
  }
];
