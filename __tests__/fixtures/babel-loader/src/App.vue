<template>
  <div id="app">
    <span>{{ test }}</span>
    <span>{{ anotherTest }}</span>
    <test />
  </div>
</template>

<script>
import test from 'package-to-transpile';
import anotherTest from './test';

export default {
  components: {
    Test: () => import('../Test.vue')
  },
  metaInfo() {
    return {};
  },
  data() {
    return {
      test,
      anotherTest
    };
  }
};
</script>
