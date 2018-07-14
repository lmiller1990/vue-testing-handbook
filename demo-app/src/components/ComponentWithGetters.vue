<template>
  <div class="fullname">
    {{ fullname }}
  </div>
</template>

<script>
// import { mapGetters } from "vuex"

export default {
  name: "ComponentWithGetters",

  computed: {
    fullname() {
      return this.$store.getters.fullname
    }

    /**
     * mapGetters helper can be used
     * ...mapGetters([
     *   'fullname'
     * ])
     */
  }
}
</script>
