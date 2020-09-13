:::tip This book is written for Vue.js 2 and Vue Test Utils v1.
Find the Vue.js 3 version [here](/v3/).
:::

## Mutations and Actions

The previous guide discussed testing components that use `$store.state` and `$store.getters`, which both provide the current state to the component. When asserting a component correctly commits a mutation or dispatches an action, what we really want to do is assert `$store.commit` and `$store.dispatch` is called with the correct handler (the mutation or action to call) and payload.

There are two ways to go about this. One is to use a real Vuex store with `createLocalVue`, and another is to use a mock store. Both these techniques are demonstrated [here](https://lmiller1990.github.io/vue-testing-handbook/vuex-in-components.html). Let's see them again, in the context of mutations and actions.

The source code for the test described on this page can be found [here](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/ComponentWithButtons.spec.js).

## Creating the Component

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
      class="dispatch" 
      @click="handleDispatch">
      Dispatch
    </button>

    <button 
      class="namespaced-dispatch" 
      @click="handleNamespacedDispatch">
      Namespaced Dispatch
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

    handleDispatch() {
      this.$store.dispatch("testAction", { msg: "Test Dispatch" })
    },

    handleNamespacedDispatch() {
      this.$store.dispatch("namespaced/very/deeply/testAction", { msg: "Test Namespaced Dispatch" })
    }
  }
}
</script>
```

## Testing with a real Vuex store

Let's write a `ComponentWithButtons.spec.js` with a test for the mutation first. Remember, we want to verify two things:

1. Did the correct mutation get committed?
2. Was the payload correct?

We will use `createLocalVue` to avoid polluting the global Vue instance.

```js
import Vuex from "vuex"
import { createLocalVue, mount } from "@vue/test-utils"
import ComponentWithButtons from "@/components/ComponentWithButtons.vue"

const localVue = createLocalVue()
localVue.use(Vuex)

const mutations = {
  testMutation: jest.fn()
}

const store = new Vuex.Store({ mutations })

describe("ComponentWithButtons", () => {

  it("commits a mutation when a button is clicked", async () => {
    const wrapper = mount(ComponentWithButtons, {
      store, localVue
    })

    await wrapper.find(".commit").trigger("click")

    expect(mutations.testMutation).toHaveBeenCalledWith(
      {},
      { msg: "Test Commit" }
    )
  })

})
```

Notice the tests are marked `await` and call `nextTick`. See [here](/simulating-user-input.html#writing-the-test) for more details on why.

There is a lot code in the test above - nothing too exciting is happening, though. We create a `localVue` and use Vuex, then create a store, passing a Jest mock function (`jest.fn()`) in place of the `testMutation`. Vuex mutations are always called with two arguments: the first is the current state, and the second is the payload. Since we didn't declare any state for the store, we expect it to be called with an empty object. The second argument is expected to be `{ msg: "Test Commit" }`, which is hard coded in the component.

This is a lot of boilerplate code to write, but is a correct and valid way to verify components are behaving correctly. Another alternative that requires less code is using a mock store. Let's see how to do that for while writing a test to assert `testAction` is dispatched.

## Testing using a mock store

Let's see the code, then compare and contrast it to the previous test. Remember, we want to verify:

1. the correct action is dispatched
2. the payload is correct

```js
it("dispatches an action when a button is clicked", async () => {
  const mockStore = { dispatch: jest.fn() }
  const wrapper = mount(ComponentWithButtons, {
    mocks: {
      $store: mockStore 
    }
  })

  await wrapper.find(".dispatch").trigger("click")
  
  expect(mockStore.dispatch).toHaveBeenCalledWith(
    "testAction" , { msg: "Test Dispatch" })
})
```

This is a lot more compact than the previous example. No `localVue`, no `Vuex` - instead of mocking the function, in the previous where we did `testMutation = jest.fn()`, we actually mock the `dispatch` function itself. Since `$store.dispatch` is just a regular JavaScript function, we are able to do this. Then we assert the correct action handler, `testAction`, is the first argument, and the second argument, the payload, is correct. We don't care what the action actually does - that can be tested in isolation. The goal of this test is to simply verify that clicking a button dispatches the correct action with payload.

Whether you use a real store or a mock store is your tests is down to personal preference. Both are correct. The important thing is you are testing your components.

## Testing a Namespaced Action (or Mutation)

The third and final example shows another way to test that an action was dispatched (or mutation committed) with the correct arguments. This combined both techniques discussed above - a real `Vuex` store, and a mocked `dispatch` method.


```js
it("dispatch a namespaced action when button is clicked", async () => {
  const store = new Vuex.Store()
  store.dispatch = jest.fn()

  const wrapper = mount(ComponentWithButtons, {
    store, localVue
  })

  await wrapper.find(".namespaced-dispatch").trigger("click")

  expect(store.dispatch).toHaveBeenCalledWith(
    'namespaced/very/deeply/testAction',
    { msg: "Test Namespaced Dispatch" }
  )
})
```

We start by creating a Vuex store, with the module(s) we are interested in. I declare the module `namespacedModule` inside the test, but in a real world app, you would just import the modules your component depends on. We then replace the `dispatch` method with a `jest.fn` mock, and make assertions against that.

## Conclusion

In this section we covered:

1. Using Vuex with a `localVue` and mocking a mutation
2. Mocking the Vuex API (`dispatch` and `commit`)
3. Using a real Vuex store with a mock `dispatch` function

The source code for the test described on this page can be found [here](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/ComponentWithButtons.spec.js).
