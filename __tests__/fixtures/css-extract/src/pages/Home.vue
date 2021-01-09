<template>
  <div>
    <span class="test">test</span>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  computed: {
    instanceCsrf() {
      return this.$csrf;
    },
    axiosCsrf() {
      return axios.defaults.headers.common['X-CSRF-TOKEN'];
    }
  }
};
</script>

<style>
.test {
  color: red;
}
</style>
