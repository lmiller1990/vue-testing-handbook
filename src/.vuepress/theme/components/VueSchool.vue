<template>
  <a 
    href="https://vueschool.io/courses/learn-how-to-test-vuejs-components?friend=vth"
    target="_blank"
    class="wrap"
    @click="track"
  >
    <img :src="$withBase('vue-school.png')">
  </a>
</div>
</template>

<script>
export default {
  name: 'VueSchool',

  methods: {
    track() {
      console.log('Opening Vue school')
      window.ga('send', 'event', 'affiliate', 'click')
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
  width: 100%;
}

@media (max-width:600px)  {
  img {
    height: 70px;
  }
}
</style>
