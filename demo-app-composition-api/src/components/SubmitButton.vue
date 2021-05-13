<template>
  <div>
    <span v-if="isAdmin">Admin Privileges</span>
    <span v-else>Not Authorized</span>
    <button>{{ msg }}</button>
  </div>
</template>

<script lang="ts">
export default {
  name: 'SubmitButton',
  props: {
    msg: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style></style>
