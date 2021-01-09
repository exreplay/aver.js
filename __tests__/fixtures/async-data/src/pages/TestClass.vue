<template>
  <div>{{ getData }}</div>
</template>

<script>
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class TestClass extends Vue {
  get getData() {
    return this.$store.getters.getData;
  }

  asyncData({ store }) {
    return store.dispatch('fetchData');
  }
}
</script>
