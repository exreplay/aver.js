<template>
  <div id="app">
    <router-link :to="{ name: 'home' }">Home</router-link>
    <router-view />
    <vue-progress-bar />
  </div>
</template>

<script>
  import { Vue, Component } from 'vue-property-decorator';

  @Component({
    metaInfo: {
      title: 'Willkommen',
      titleTemplate: '%s | Site',
      meta: [
        { name: 'description', content: '' },
        { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' },
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { rel: 'icon', type: 'image/png', href: 'public/images/favicon-32x32.png', sizes: '32x32' },
        { rel: 'icon', type: 'image/png', href: 'public/images/favicon-16x16.png', sizes: '16x16' }
      ],
      link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Nunito+Sans:400,700,900' }
      ]
    }
  })
  export default class App extends Vue {
    created() {
      this.$Progress.start();

      this.$router.beforeEach((to, from, next) => {
        if (to.meta.progress !== undefined) {
          const meta = to.meta.progress;
          this.$Progress.parseMeta(meta);
        }

        this.$Progress.start();
        next();
      });

      this.$router.afterEach((to, from) => {
        this.$Progress.finish();
      });
    }

    mounted() {
      this.$Progress.finish();
    }
  }
</script>
