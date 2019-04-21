## Testing Vuex in components

The source code for the test described on this page can be found [here](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/ComponentWithGetters.spec.js).

## Using `createLocalVue` to test `$store.state`

In a regular Vue app, we install Vuex using `Vue.use(Vuex)`, and then pass a new Vuex store to the app. If we do the same in a unit test, though, all unit tests will receive the Vuex store - even tests that are not using the store. `vue-test-utils` provides a `createLocalVue` method, which provides a temporary `Vue` instance to be used on a test by test basis. Let's see how to use it. First, a simple `<ComponentWithGetters>` component that renders a username in the store's base state.

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

We can use `createLocalVue` to create a temporary Vue instance, and install Vuex. Then we simply pass the a new `store` in the component's mounting options. A full test looks like this:

```js
import Vuex from "vuex"
import { shallowMount, createLocalVue } from "@vue/test-utils"
import ComponentWithVuex from "@/components/ComponentWithVuex.vue"

const localVue = createLocalVue()
localVue.use(Vuex)

const store = new Vuex.Store({
  state: {
    username: "alice"
  }
})

describe("ComponentWithVuex", () => {
  it("renders a username using a real Vuex store", () => {
    const wrapper = shallowMount(ComponentWithVuex, { 
      store, 
      localVue 
    })

    expect(wrapper.find(".username").text()).toBe("alice")
  })
})
```

The tests passes. Creating a new `localVue` introduces some boilerplate, and the test is quite long. If you have a lot of components that use a Vuex store, an alternative is to use the `mocks` mounting option, and simply mock the store. 

## Using a mock store

Using the `mocks` mounting options, you can mock the global `$store` object. This means you do not need to use `createLocalVue`, or create a new Vuex store. Using this technique, the above test can be rewritten like this:

```js
it("renders a username using a mock store", () => {
  const wrapper = shallowMount(ComponentWithVuex, {
    mocks: {
      $store: {
        state: { username: "alice" }
      }
    }
  })

  expect(wrapper.find(".username").text()).toBe("alice")
})
```

I personally prefer this approach. All the necessary data is declared inside the test, and it is a bit more compact. Both techniques are useful, and neither is better or worse than the other.

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

First, using a real Vuex store and `createLocalVue`, the test looks like this:

```js
const localVue = createLocalVue()
localVue.use(Vuex)

const store = new Vuex.Store({
  state: {
    firstName: "Alice",
    lastName: "Doe"
  },

  getters: {
    fullname: (state) => state.firstName + " " + state.lastName
  }
})

it("renders a username using a real Vuex getter", () => {
  const wrapper = shallowMount(ComponentWithGetters, { store, localVue })

  expect(wrapper.find(".fullname").text()).toBe("Alice Doe")
})
```

The test is very compact - just two lines of code. There is a lot of setup involved, however - we are bascially rebuilding the Vuex store. An alternative is to import the real Vuex store, with the actual getter. This introduces another dependency to the test though, and when developing a large system, it's possible the Vuex store might be being developed by another programmer, and has not been implemented yet. 

Let's see how we can write the test using the `mocks` mounting option:

```js
it("renders a username using computed mounting options", () => {
  const wrapper = shallowMount(ComponentWithGetters, {
    mocks: {
      $store: {
        getters: {
          fullname: "Alice Doe"
        }
      }
    }
  })

  expect(wrapper.find(".fullname").text()).toBe("Alice Doe")
})
```

Now all the required data is contained in the test. Great! I strongly prefer this, since the test is fully contained, and all the knowledge required to understand what the component should do is contained in the test.

We can make the test even more concise though, using the `computed` mounting option.

## Mocking getters using `computed`

Getters are generally wrapped in `computed` properties. Remember, this test is all about making sure the component behaves correctly given the current state of the store. We are not testing the implementation of `fullname`, or to see if `getters` work. This means we can simply replace real store, or the mock store, using the `computed` mounting option. The test can be rewritten like this:

```js
it("renders a username using computed mounting options", () => {
  const wrapper = shallowMount(ComponentWithGetters, {
    computed: {
      fullname: () => "Alice Doe"
    }
  })

  expect(wrapper.find(".fullname").text()).toBe("Alice Doe")
})
```

This is more concise than the two previous tests, and still expresses the component's intention.

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

- using `createLocalVue` and a real Vuex store to test `$store.state` and `getters`
- using the `mocks` mounting option to mock `$store.state` and `getters`
- using the `computed` mounting option to set the desired value of a Vuex getter

Techniques to test the implentation of Vuex getters in isolation can be found in [this guide](https://lmiller1990.github.io/vue-testing-handbook/vuex-getters.html).

The source code for the test described on this page can be found [here](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/ComponentWithGetters.spec.js).
