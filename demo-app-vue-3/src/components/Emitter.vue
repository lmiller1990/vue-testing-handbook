<template>
  <div>
  </div>
</template>

<script>
export default {
  name: "Emitter",
  emits: ['emitEvent'],
  methods: { 
    emitEvent() {
      this.$emit("myEvent", "name", "password")
    }
  }
}
</script>

<style scoped>
</style>
