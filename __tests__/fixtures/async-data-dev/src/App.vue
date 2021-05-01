<template>
  <div id="app">
    <div>{{ data }}</div>
    <router-view />
  </div>
</template>

<script>
export default {
  data() {
    return {
      data: ''
    };
  },
  asyncData() {
    return {
      data: 'app.vue'
    };
  },
  metaInfo() {
    return {};
  }
};
</script>
