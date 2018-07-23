<template>
  <div>
    Nested Route
    <div class="username">
      {{ $route.params.username }}
    </div>
  </div>
</template>

<script>
export default {
  name: "NestedRoute"
}
</script>

