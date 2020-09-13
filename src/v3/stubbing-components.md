:::tip This book is written for Vue.js 3 and Vue Test Utils v2.
Find the Vue.js 2 version [here](/).
:::

## Stubbing components

You can find the test described on this page [here](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/ParentWithAPICallChild.spec.js).

## Why stub?

When writing unit tests, often we want to _stub_ parts of the code we are not interested in. A stub is simply a piece of code that stands in for another. Let's say you are writing a test for a `<UserContainer>` component. It looks like this:

```html
<UserContainer>
  <UsersDisplay />
</UserContainer>
```

`<UsersDisplay>` has a `created` lifecycle method like this:

```js
created() {
  axios.get("/users")
}
```

We want to write a test that asserts `<UsersDisplay>` is rendered. 

`axios` is making an ajax request to an external service in the `created` hook. That means when you do `mount(UserContainer)`, `<UsersDisplay>` is also mounted, and `created` initiates an ajax request. Since this is a unit test, we only are interested in whether `<UserContainer>` correctly renders `<UsersDisplay>` - verifying the ajax request is triggered with the correct endpoint, etc, is the responsibility of `<UsersDisplay>`, which should be tested in the `<UsersDisplay>` test file.

One way to prevent the `<UsersDisplay>` from initiating the ajax request is by _stubbing_ the component out. Let's write our own components and test, to get a better understanding of the different ways and benefits of using stubs.

## Creating the components

This example will use two components. The first is `ParentWithAPICallChild`, which simply renders another component:

```html
<template>
  <ComponentWithAsyncCall />
</template>

<script>
import ComponentWithAsyncCall from "./ComponentWithAsyncCall.vue"

export default {
  name: "ParentWithAPICallChild",

  components: {
    ComponentWithAsyncCall
  }
}
</script>
```

`<ParentWithAPICallChild>` is a simple component. It's sole responsibility is to render `<ComponentWithAsyncCall>`. `<ComponentWithAsyncCall>`, as the name suggests, makes an ajax call using the `axios` http client:

```html
<template>
  <div></div>
</template>

<script>
import axios from "axios"

export default {
  name: "ComponentWithAsyncCall",
  
  created() {
    this.makeApiCall()
  },
  
  methods: {
    async makeApiCall() {
      console.log("Making api call")
      await axios.get("https://jsonplaceholder.typicode.com/posts/1")
    }
  }
}
</script>
```

`<ComponentWithAsyncCall>` calls `makeApiCall` in the `created` lifecycle hook.

## Write a test using `mount`

Let's start off by writing a test to verify that `<ComponentWithAsyncCall>` is rendered:

```js
import { shallowMount, mount } from '@vue/test-utils'
import ParentWithAPICallChild from '@/components/ParentWithAPICallChild.vue'
import ComponentWithAsyncCall from '@/components/ComponentWithAsyncCall.vue'

describe('ParentWithAPICallChild.vue', () => {
  it('renders with mount and does initialize API call', () => {
    const wrapper = mount(ParentWithAPICallChild)

    expect(wrapper.find(ComponentWithAsyncCall).exists()).toBe(true)
  })
})
```

Running `yarn test:unit` yields:

```
PASS  tests/unit/ParentWithAPICallChild.spec.js

console.log src/components/ComponentWithAsyncCall.vue:17
  Making api call
```

The test is passing - great! However, we can do better. Notice the `console.log` in the test output - this comes from the `makeApiCall` method. Ideally we don't want to make calls to external services in our unit tests, especially when it's from a component that is not the main focus of the current test. We can use the `stubs` mounting option, described in the `vue-test-utils` docs [here](https://vue-test-utils.vuejs.org/api/options.html#stubs).

## Using `stubs` to stub `<ComponentWithAsyncCall>`

Let's update the test, this time stubbing `<ComponentWithAsyncCall>`:

```js
it('renders with mount and does initialize API call', () => {
  const wrapper = mount(ParentWithAPICallChild, {
    stubs: {
      ComponentWithAsyncCall: true
    }
  })

  expect(wrapper.find(ComponentWithAsyncCall).exists()).toBe(true)
})
```

The test still passes when `yarn test:unit` is run, however the `console.log` is nowhere to be seen. That's because passing `[component]: true` to `stubs` replaced the original component with a _stub_. The external interface is still the same (we can still select it using `find`, since the `name` property, which is used internally by `find`, is still the same). The internal methods, such as `makeApiCall`, are replaced by dummy methods that don't do anything - they are "stubbed out".

You can also specify the markup to use for the stub, if you like:

```js
const wrapper = mount(ParentWithAPICallChild, {
  stubs: {
    ComponentWithAsyncCall: "<div class='stub'></div>"
  }
})
```

## Automatically stubbing with `shallowMount`

Instead of using `mount` and manually stubbing `<ComponentWithAsyncCall>`, we can simply use `shallowMount`, which automatically stubs any other components by default. The test with `shallowMount` looks like this:

```js
it('renders with shallowMount and does not initialize API call', () => {
  const wrapper = shallowMount(ParentWithAPICallChild)

  expect(wrapper.find(ComponentWithAsyncCall).exists()).toBe(true)
})
```

Running `yarn test:unit` doesn't show any `console.log`, and test passes. `shallowMount` automatically stubbed `<ComponentWithAsyncCall>`. `shallowMount` is useful for testing components that have a lot of child components, that might have behavior triggered in lifecycle hooks such as `created` or `mounted`, as so on. I tend to use `mount` by default, unless I have a good reason to use `shallowMount`. It depends on your use case, and what you are testing. Try to do whatever is closest to how your components will be used in production.

## Conclusion

- `stubs` is useful for stubbing out the behavior of children that is unrelated to the current unit test
- `shallowMount` stubs out child components by default
- you can pass `true` to create a default stub, or pass your own custom implementation

You can find the test described on this page [here](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/ParentWithAPICallChild.spec.js).
