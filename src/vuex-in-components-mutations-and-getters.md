### Mutations and Actions

The previous guide discussed testing components that use `$store.state` and `$store.getters`, which both provide the current state to the component. When asserting a component correctly commits a mutation or dispatches an action, what we really want to do is assert `$store.commit` and `$store.dispatch` is called with the correct handler (the mutation or action to call) and payload.

There are two ways to go about this. One is to use a real Vuex store with `createLocalVue`, and another is to use a mock store. Both these techniques are demonstrated [here](https://lmiller1990.github.io/vue-testing-handbook/vuex-in-components.html). Let's see them again, in the context of mutations and actions.

### Creating the Component

For these examples, we will test a `<ComponentWithButtons>` component:

```vue
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
```

### Testing with a real Vuex store

Let's write a `ComponentWithButtons.spec.js` with a test for the mutation first. Remember, we want to verify two things:

1. Did the correct mutation get committed?
2. Was the payload correct?

```js
```
