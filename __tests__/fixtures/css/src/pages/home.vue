<template>
  <div id="home">
    <span id="module">{{ $style.test }}</span>
  </div>
</template>

<script>
export default {};
</script>

<style>
h1 {
  color: red;
}
</style>

<style module>
.test {
  color: green;
}
</style>

<style scoped>
.test2 {
  color: blue;
}
</style>
