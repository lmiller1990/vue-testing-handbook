<template>
  <a 
    href="https://vueschool.io/courses/learn-how-to-test-vuejs-components?friend=vth"
    class="wrap"
  >
    <img :src="$withBase('vue-school.png')">
  </a>
</div>
</template>

<script>
export default {
  name: 'VueSchool'
}
</script>

<style scoped>
.wrap {
  display: flex;
  padding: 0 18px;
}

img {
  width: 100%;
}
</style>
