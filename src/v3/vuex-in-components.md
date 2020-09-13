:::tip This book is written for Vue.js 3 and Vue Test Utils v2.
Find the Vue.js 2 version [here](/).
:::

## Testing Vuex in components

The source code for the test described on this page can be found [here](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/ComponentWithVuex.spec.js).

## Using `global.plugins` to test `$store.state`

In a regular Vue app, we install Vuex using `app.use(store)`, which installs a globally available Vuex store in the app. In a unit test, we can do exactly the same thing. Unlike a regular Vue app, we don't want to share the same Vuex store across every test - we want a fresh one for each test.
Let's see how we can do that. First, a simple `<ComponentWithGetters>` component that renders a username in the store's base state.

```html
<template>
  <div>
    <div class="username">
      {{ username }}
    </div>
  </div>
</template>

<script>
export default {
  name: "ComponentWithVuex",

  data() {
    return {
      username: this.$store.state.username
    }
  }
}
</script>
```

We can use `createStore` to create a new Vuex store. Then we pass the new `store` in the component's `global.plugins` mounting options. A full test looks like this:

```js
import { createStore } from "vuex"
import { mount } from "@vue/test-utils"
import ComponentWithVuex from "../../src/components/ComponentWithVuex.vue"

const store = createStore({
  state() {
    return {
      username: "alice",
      firstName: "Alice",
      lastName: "Doe"
    }
  },

  getters: {
    fullname: (state) => state.firstName + " " + state.lastName
  }
})

describe("ComponentWithVuex", () => {
  it("renders a username using a real Vuex store", () => {
    const wrapper = mount(ComponentWithVuex, {
      global: {
        plugins: [store]
      }
    })

    expect(wrapper.find(".username").text()).toBe("alice")
  })
})
```

The tests passes. Creating a new Vuex store every test introduces some boilerplate. The total code required is quite long. If you have a lot of components that use a Vuex store, an alternative is to use the `global.mocks` mounting option, and simply mock the store. 

## Using a mock store

Using the `mocks` mounting options, you can mock the global `$store` object. This means you do not need to use create a new Vuex store. Using this technique, the above test can be rewritten like this:

```js
it("renders a username using a mock store", () => {
  const wrapper = mount(ComponentWithVuex, {
    mocks: {
      $store: {
        state: { username: "alice" }
      }
    }
  })

  expect(wrapper.find(".username").text()).toBe("alice")
})
```

I do not recommend one or the other. The first test uses a real Vuex store, so it's closer to how you app will work in production. That said, it an introduce a lot of boilerplate and if you have a very complex Vuex store you may end up with very large helper methods to create the store that make your tests difficult to understand. 

The second approach uses a mock store. On of the good things about this is all the necessary data is declared inside the test, making it easier to understand, and it is a bit more compact. It is less likely to catch regressions in your Vuex store, though. You could delete your entire Vuex store and this test would still pass - not ideal.

Both techniques are useful, and neither is better or worse than the other.

## Testing `getters`

Using the above techniques, `getters` are easily tested. First, a component to test:

```html
<template>
  <div class="fullname">
    {{ fullname }}
  </div>
</template>

<script>
export default {
  name: "ComponentWithGetters",

  computed: {
    fullname() {
      return this.$store.getters.fullname
    }
  }
}
</script>
```

We want to assert that the component correctly renders the user's `fullname`. For this test, we don't care where the `fullname` comes from, just that the component renders is correctly.

First, using a real Vuex store, the test looks like this:

```js
const store = createStore({
  state: {
    firstName: "Alice",
    lastName: "Doe"
  },

  getters: {
    fullname: (state) => state.firstName + " " + state.lastName
  }
})

it("renders a username using a real Vuex getter", () => {
  const wrapper = mount(ComponentWithGetters, {
    global: {
      plugins: [store]
    }
  })

  expect(wrapper.find(".fullname").text()).toBe("Alice Doe")
})
```

The test is very compact - just two lines of code. There is a lot of setup involved, however - we are had to use a Vuex store. Note we are *not* using the Vuex store our app would be using, we created a minimal one with the basic data needed to supply the `fullname` getter the component was expecting.

An alternative is to import the real Vuex store you are using in your app, which includes the actual getters. This introduces another dependency to the test though, and when developing a large system, it's possible the Vuex store might be being developed by another programmer, and has not been implemented yet, but there is no reason this won't work.

An alternative would be to write the test using the `global.mocks` mounting option:

```js
it("renders a username using computed mounting options", () => {
  const wrapper = mount(ComponentWithGetters, {
    global: {
      mocks: {
        $store: {
          getters: {
            fullname: "Alice Doe"
          }
        }
      }
    }
  })

  expect(wrapper.find(".fullname").text()).toBe("Alice Doe")
})
```

Now all the required data is contained in the test. Great! I like this. The test is fully contained, and all the knowledge required to understand what the component should do is contained in the test.

## The `mapState` and `mapGetters` helper

The above techniques all work in conjuction with Vuex's `mapState` and `mapGetters` helpers. We can update `ComponentWithGetters` to the following:

```js
import { mapGetters } from "vuex"

export default {
  name: "ComponentWithGetters",

  computed: {
    ...mapGetters([
      'fullname'
    ])
  }
}
```

The tests still pass.

## Conclusion

This guide discussed:

- using `createStore` to create a real Vuex store and install it with `global.plugins`
- how to test `$store.state` and `getters`
- using the `global.mocks` mounting option to mock `$store.state` and `getters`

Techniques to test the implentation of Vuex getters in isolation can be found in [this guide](https://lmiller1990.github.io/vue-testing-handbook/vuex-getters.html).

The source code for the test described on this page can be found [here](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/ComponentWithVuex.spec.js).
