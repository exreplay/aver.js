<template>
  <div>
    <span>home route</span>
    <span>{{ asyncData }}</span>
  </div>
</template>

<script>
export default {
  asyncData() {
    return {
      asyncData: 'some async data'
    };
  },
  data() {
    return {
      asyncData: ''
    };
  }
};
</script>
