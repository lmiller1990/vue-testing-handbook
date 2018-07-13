<template>
<div>
  <span v-if="isAdmin">Admin Privledges</span>
  <span v-else>Not Authorized</span>
  <button>
    {{ msg }}
  </button>
</div>
</template>

<script>
export default {
  name: "SubmitButton",

  props: {
    msg: {
      type: String,
      required: true
    },
    isAdmin: {
      type: Boolean,
      default: false
    }
  }
}
</script>
