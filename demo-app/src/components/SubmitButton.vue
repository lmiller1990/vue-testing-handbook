<template>
<div>
  <span v-if="isAdmin">管理者権限を実行する</span>
  <span v-else>権限がありません</span>
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