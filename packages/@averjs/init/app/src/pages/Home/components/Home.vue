<template>
  <div>
    <div :class="$style.test">Hallo</div>
    <logo></logo>
  </div>
</template>

<script>
  import { Vue, Component } from 'vue-property-decorator';
	
  @Component({
    components: {
      Logo: () => import('@/components/Logo')
    }
  })
  export default class Home extends Vue {
    mounted() {
      console.log('test');
    }
  }
</script>

<style lang="scss" module>
    .test {
        color: yellowgreen
    }
</style>
