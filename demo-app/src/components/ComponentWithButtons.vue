<template>
  <div>
    <button 
      class="commit" 
      @click="handleCommit">
      Commit
    </button>

    <button 
      class="commit" 
      @click="handleDispatch">
      Dispatch
    </button>
  </div>
</template>

<script>
export default {
  name: "ComponentWithButtons",

  methods: {
    handleCommit() {
      this.$store.commit("testMutation", { msg: "Test Commit" })
    },

    handleCommit() {
      this.$store.dispatch("testAction", { msg: "Test Dispatch" })
    }
  }
}
</script>

