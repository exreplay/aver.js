<template>
  <div>
    <span>{{ post1 }}</span>
    <span>{{ post2 }}</span>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      post1: null,
      post2: null
    };
  },
  async mounted() {
    delete axios.defaults.headers.common['X-CSRF-TOKEN'];

    // should fail
    try {
      await axios.post('/csrf');
    } catch (error) {
      this.post1 = error.response.status;
    }

    // should not fail
    try {
      const { status } = await axios.post('/no-csrf');
      this.post2 = status;
    } finally {
      window.status = 'ready';
    }
  }
};
</script>
