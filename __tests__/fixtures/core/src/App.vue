<template>
  <div id="app">{{ faviconStatus }}{{ error }}</div>
</template>

<script>
import axios from 'axios';

export default {
  metaInfo() {
    return {};
  },
  data() {
    return {
      faviconStatus: 0,
      error: null
    };
  },
  async mounted() {
    const response = await axios.get('/favicon.ico');
    this.faviconStatus = response.status;
    await this.$nextTick();
    window.appStatus = 'ready';
  }
};
</script>
