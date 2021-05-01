export default [
  {
    path: '/',
    name: 'home',
    component: () => import('./Home.vue'),
    children: [
      {
        path: 'homechild',
        name: 'homechild',
        component: () => import('./HomeChild.vue')
      }
    ]
  }
];
