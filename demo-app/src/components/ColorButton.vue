<template>
  <button
    :style="{ color: color }"
  >
    {{ msg }}
  </button>
</template>

<script>
export default {
  name: "ColorButton",

  props: {
    msg: {
      type: String,
      required: true
    },
    color: {
      type: String,
      default: "pink"
    }
  }
}
</script>