<template>
  <ComponentWithAsyncCall />
</template>

<script>
import ComponentWithAsyncCall from "./ComponentWithAsyncCall.vue"

export default {
  name: "ParentWithAPICallChild",

  components: {
    ComponentWithAsyncCall
  }
}
</script>
