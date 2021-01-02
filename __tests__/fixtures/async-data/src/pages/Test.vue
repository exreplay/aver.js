<template>
  <div>{{ data }}</div>
</template>

<script>
export default {
  asyncData({ store }) {
    return store.dispatch('fetchData');
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
