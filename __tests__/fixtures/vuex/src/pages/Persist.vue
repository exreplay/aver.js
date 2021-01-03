<template>
  <div>{{ persist }}<button @click="changePersist"></button></div>
</template>

<script>
import { Vue, Component } from 'vue-property-decorator';
import { TestModule } from './vuex/TestStore';

@Component
export default class Persist extends Vue {
  get persist() {
    return TestModule.persist;
  }

  set persist(val) {
    TestModule.persist = val;
  }

  changePersist() {
    this.persist = 'changed';
  }
}
</script>
