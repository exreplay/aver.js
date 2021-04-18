<template>
  <div>{{ data }}</div>
</template>

<script>
export default {
  asyncData() {
    return {
      data: 'hello from testchild'
    };
  },
  data() {
    return {
      data: ''
    };
  }
};
</script>
