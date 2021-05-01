<template>
  <div>
    <div>{{ $t('global') }}</div>
    <button @click="$locale.change('de')">change language</button>
  </div>
</template>

<script>
export default {};
</script>
