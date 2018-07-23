### Vue Router

Since a router usually involves multiple components operating together, often routing tests take place further up the [testing pyramid](https://medium.freecodecamp.org/the-front-end-test-pyramid-rethink-your-testing-3b343c2bca51), right up at the e2e test level. Some unit tests around your routing can be beneficial as well.

Much like other sections, there are two ways to test components that interact with a router:

1. Use an real router
2. Mock the `$route` and `$router` objects

Since most Vue applications use the official Vue Router, this guide will focus that.

The source code for the test described on this page can be found [here](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/App.spec.js) and [here](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/NestedRoute.spec.js).

### Creating the Components

We will build a simple `<App>`, that has a `/nested-child` route. Visiting `/neested-child` renders a `<NestedRoute>` component. Create `App.vue`, and insert the following:

```vue
<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>

export default {
  name: 'app'
}
</script>
```

`<NestedRoute>` is equally as minimal:

```vue
<template>
  <div>Nested Route</div>
</template>

<script>
export default {
  name: "NestedRoute"
}
</script>
``

### Creating the Router and Routes

Now we need some routes to test. Let's start with the routes:

```js
import NestedRoute from "@/components/NestedRoute.vue"

export default [
  { path: "/nested-route", component: NestedRoute }
]
```

In a real app, you normally would create a `router.js` file and import the routes we made, and write something like this:

```js
import Vue from "vue"
import VueRouter from "vue-router"
import routes from "./routes.js"

Vue.use(VueRouter)

export default new VueRouter({ routes })
```

Since we do not want to polluate the global namespace by calling `Vue.use(...)` in our tests, we will create the router on a test by test basis. This will let us have more fine grained control over the state of the application during the unit tests.

### Writing the Test

Let's look at some code, then talk about what's going on. We are testing `App.vue`, so in `App.spec.js` add the following:

```js
import { shallowMount, mount, createLocalVue } from "@vue/test-utils"
import App from "@/App.vue"
import VueRouter from "vue-router"
import NestedRoute from "@/components/NestedRoute.vue"
import routes from "@/routes.js"

const localVue = createLocalVue()
localVue.use(VueRouter)

describe("App", () => {
  it("renders a child component via routing", () => {
    const router = new VueRouter({ routes })
    const wrapper = mount(App, { localVue, router })

    router.push("/nested-route")

    expect(wrapper.find(NestedRoute).exists()).toBe(true)
  })
})
```

As usual, we start by importing the various modules for the test. Notably, we are importing the actual routes we will be using for the application. This is ideal in some ways - if the real routing breaks, the tests should break, too. 

We can use the same `localVue` for all the `<App>` tests, so it is declared outside the first `describe` block. However, since we might like to have different tests for different routes, the router is defined inside the `it` block.

Another notable point that is different from other guides in this book is we are using `mount` instead of `shallowMount`. If we use `shallowMount`, `<router-link>` will be stubbed out, regardless of the router, a useless stub component will be rendered. If you are making assertions that components are rendered based on routing, you have to use `mount`.

### Workaround for large render trees using `mount`

Sometimes using `mount` is not ideal. For example, if you are rendering your entire `<App>` component, chances are the render tree is huge. A lot of children components will trigger various lifecycle hooks, making API requests and the such.

If you are using Jest, Jest's powerful mock system provides an elegent solution to this problem. You can simply mock the children, in this case `<NestedRoute>`. The following mock can be used and the above test will still pass:

```js
jest.mock("@/components/NestedRoute.vue", () => ({
  name: "NestedRoute",
  render: h => h("div")
}))
```

### Using a Mock Router

Sometimes a real router is not necessary. Let's update `<NestedRoute>` to show a username based on the current path's query string. This time we will use TDD to create the feature. Here is a basic test that simply renders the component and makes an assertion:

```vue
import { shallowMount } from "@vue/test-utils"
import NestedRoute from "@/components/NestedRoute.vue"
import routes from "@/routes.js"

describe("NestedRoute", () => {
  it("renders a username from query string", () => {
    const username = "alice"
    const wrapper = shallowMount(NestedRoute)

    expect(wrapper.find(".username").text()).toBe(username)
  })
})
```

We don't have a `<div class="username">` yet, so running the test gives us:

```
FAIL  tests/unit/NestedRoute.spec.js
  NestedRoute
    ✕ renders a username from query string (25ms)

  ● NestedRoute › renders a username from query string

    [vue-test-utils]: find did not return .username, cannot call text() on empty Wrapper
``` 

Update `<NestedRoute>`:

```vue
<template>
  <div>
    Nested Route
    <div class="username">
      {{ $route.params.username }}
    </div>
  </div>
</template>
```

Now the test fails with:

```
FAIL  tests/unit/NestedRoute.spec.js
  NestedRoute
    ✕ renders a username from query string (17ms)

  ● NestedRoute › renders a username from query string

    TypeError: Cannot read property 'params' of undefined
```

This is because `$route` does not exist. We could use a real router, but in this case it is easier to just use the `mocks` mounting option:

```js
it("renders a username from query string", () => {
  const username = "alice"
  const wrapper = shallowMount(NestedRoute, {
    mocks: {
      $route: {
        params: { username }
      }
    }
  })

  expect(wrapper.find(".username").text()).toBe(username)
})
```

Now the test passes. In this case, we don't do any navigation or anything that relies on the implementation of the router, so using `mocks` is good. We don't really care how `username` comes to be in the query string, only that it is present. 

Often the server will provide the routing, as opposed to client side routing with Vue Router. In such cases, using `mocks` to set the query string in a test is a good alternative to using a real instance of Vue Router.
