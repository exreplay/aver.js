<template>
  <div>
    <div>{{ $t('test') }}</div>
    <div>{{ $locale.current() }}</div>
    <button @click="$locale.change('de')">change language</button>
  </div>
</template>

<script>
export default {};
</script>

<i18n>
{
  "de": {
    "test": "test de"
  },
  "en": {
    "test": "test en"
  }
}
</i18n>
