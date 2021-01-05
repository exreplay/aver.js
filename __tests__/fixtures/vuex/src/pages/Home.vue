<template>
  <div>
    <span>{{ testModule }}</span>
    <span>{{ globalTest }}</span>
    <span>{{ entryTest }}</span>
    <span>{{ basicModuleTest }}</span>
  </div>
</template>

<script>
import { TestModule } from './vuex/TestStore';

export default {
  computed: {
    testModule() {
      return TestModule.test;
    },
    globalTest() {
      return this.$store.getters.getGlobalTest;
    },
    entryTest() {
      return this.$store.state.entry.test;
    },
    basicModuleTest() {
      return this.$store.state.basicModule.test;
    }
  }
};
</script>
