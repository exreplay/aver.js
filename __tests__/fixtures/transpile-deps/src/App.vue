<template>
  <div id="app">
    <span>{{ test }}</span>
    <span>{{ anotherTest }}</span>
  </div>
</template>

<script>
import test from 'package-to-transpile';
import anotherTest from './test';

export default {
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
