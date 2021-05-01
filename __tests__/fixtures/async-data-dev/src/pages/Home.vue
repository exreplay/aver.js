<template>
  <div>
    <router-link :to="{ name: 'homechild' }">{{ test }}</router-link>
    <router-view />
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
