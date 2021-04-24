<template>
  <div>{{ data }}</div>
</template>

<script>
export default {
  asyncData() {
    return {
      data: 'homechild'
    };
  },
  data() {
    return {
      data: ''
    };
  },
  mounted() {
    window.status = 'ready';
  }
};
</script>
