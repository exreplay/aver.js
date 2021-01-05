<template>
  <div>
    <span>{{ vuex }}</span>
    <span>{{ src }}</span>
    <span>{{ root }}</span>
    <span>{{ components }}</span>
    <span>{{ mixins }}</span>
    <span>{{ resources }}</span>
    <span>{{ pages }}</span>
    <span>{{ test }}</span>
  </div>
</template>

<script>
import vuex from '@vuex/index';
import src from '@/index';
import root from '@@/index';
import components from '@components/index';
import mixins from '@mixins/index';
import resources from '@resources/index';
import pages from '@pages/index';
import test from '@test/index';

export default {
  data() {
    return {
      vuex,
      src,
      root,
      components,
      mixins,
      resources,
      pages: JSON.stringify(pages),
      test
    };
  }
};
</script>
