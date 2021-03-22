<template>
  <div>
    <router-link :to="{ name: 'test' }">{{ test }}</router-link>
  </div>
</template>

<script>
export default {
  data() {
    return {
      test: ''
    };
  },
  asyncData() {
    return {
      test: 'ssr'
    };
  }
};
</script>
