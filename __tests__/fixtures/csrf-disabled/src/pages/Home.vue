<template>
  <div>
    <span>Instance variable: {{ instanceCsrf }}</span>
    <span>Axios default: {{ axiosCsrf }}</span>
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
