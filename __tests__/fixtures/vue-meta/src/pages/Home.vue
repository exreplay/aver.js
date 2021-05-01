<template>
  <div></div>
</template>

<script>
export default {
  metaInfo() {
    return {
      title: 'home',
      meta: [{ name: 'description', content: 'test' }],
      headAttrs: {
        class: 'head'
      },
      htmlAttrs: {
        lang: 'en'
      },
      bodyAttrs: {
        class: 'body'
      },
      link: [
        {
          rel: 'stylesheet',
          href:
            'https://fonts.googleapis.com/css?family=Nunito+Sans:400,700,900'
        }
      ],
      style: [
        { cssText: '.head { color: red }', type: 'text/css' },
        { cssText: '.pbody { color: red }', type: 'text/css', pbody: true },
        { cssText: '.body { color: red }', type: 'text/css', body: true }
      ],
      script: [
        {
          innerHTML: 'console.log("I am in head");',
          type: 'text/javascript'
        },
        {
          innerHTML: 'console.log("I am in pbody");',
          type: 'text/javascript',
          pbody: true
        },
        {
          innerHTML: 'console.log("I am body");',
          type: 'text/javascript',
          body: true
        }
      ],
      noscript: [
        { innerHTML: 'i am in head' },
        { innerHTML: 'i am in pbody', pbody: true },
        { innerHTML: 'i am in body', body: true }
      ],
      __dangerouslyDisableSanitizers: ['script']
    };
  }
};
</script>
