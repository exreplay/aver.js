<template>
  <div>
    <div>{{ data }}</div>
    <router-view />
  </div>
</template>

<script>
export default {
  async asyncData({ store }) {
    await store.dispatch('fetchData');
  },
  computed: {
    data() {
      return this.$store.getters.getData;
    }
  },
  mounted() {
    window.status = 'ready';
  }
};
</script>
