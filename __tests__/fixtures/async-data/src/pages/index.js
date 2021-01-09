export default [
  {
    path: '/',
    name: 'home',
    component: () => import('./Home.vue')
  },
  {
    path: '/test',
    name: 'test',
    component: () => import('./Test.vue')
  },
  {
    path: '/test-class',
    name: 'test-class',
    component: () => import('./TestClass.vue')
  }
];
