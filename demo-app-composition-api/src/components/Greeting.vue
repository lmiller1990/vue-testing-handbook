<template>
  <div>
    {{ greeting }}
  </div>
</template>

<script lang="ts">
export default {
  name: 'Greeting',
  setup() {
    const greeting = 'Vue and TDD';

    return {
      greeting,
    };
  },
};
</script>
