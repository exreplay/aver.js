<template>
  <div id="app">
    <span>{{ $test }}</span>
    <span>{{ test }}</span>
  </div>
</template>

<script>
import test from './build';

export default {
  metaInfo() {
    return {};
  },
  data() {
    return {
      test
    };
  }
};
</script>
