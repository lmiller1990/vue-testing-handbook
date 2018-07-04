<template>
  <button>
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
      defalt: "#00A4AC"
    }
  }
}
</script>