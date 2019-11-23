<template>
  <a 
    href="https://vueschool.io/courses/learn-how-to-test-vuejs-components?friend=vth"
    target="_blank"
    class="wrap"
    @click="track"
  >
    <img :src="$withBase('vueschool-banner-small.png')">
    <!--
      <img :src="$withBase('vue-school.png')">
    -->
  </a>
</div>
</template>

<script>
export default {
  name: 'VueSchool',

  methods: {
    track() {
      console.log('Opening Vue school')
      window.ga('send', 'event', 'affiliate', 'click', 'vue-school')
    }
  }
}
</script>

<style scoped>
.wrap {
  display: flex;
  padding: 0 18px;
}

img {
  border: 3px solid #1d285f;
  width: 100%;
}

@media (max-width:600px)  {
  img {
    /* height: 70px; */
    height: 40px;
  }
}
</style>
