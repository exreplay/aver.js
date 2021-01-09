<template>
  <div></div>
</template>

<script>
export default {};
</script>

<style>
@import './test.css';

/** postcss-preset-env plugin */
:root {
  --mainColor: #12345678;
}

body {
  color: var(--mainColor);
  font-family: system-ui;
  overflow-wrap: break-word;
}

/** provided precss postcss plugin in aver config */

$blue: #056ef0;
$column: 200px;

.menu_link {
  background: $blue;
  width: $column;
}

/** cssnano plugin */

h1::before,
h1:before {
  margin: 10px 20px 10px 20px;
}
</style>
