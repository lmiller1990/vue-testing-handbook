<template>
  <div>{{ numbers }}</div>
</template>

<script lang="ts">
export default {
  props: {
    even: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    numbers() {
      const values = [];

      for (let index = 1; index <= 10; index++) {
        if (this.even) {
          index % 2 === 0 ? values.push(index) : null;
        } else {
          index % 2 !== 0 ? values.push(index) : null;
        }
      }

      return values.join(', ');
    },
  },
};
</script>

<style></style>
