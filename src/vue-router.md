## Vue Router

Since a router usually involves multiple components operating together, often routing tests take place further up the [testing pyramid](https://medium.freecodecamp.org/the-front-end-test-pyramid-rethink-your-testing-3b343c2bca51), right up at the e2e/integration test level. However, having some unit tests around your routing can be beneficial as well.

Much like previous sections discuss, there are two ways to test components that interact with a router:

1. Using an real router instance
2. Mocking the `$route` and `$router` global objects

Since most Vue applications use the official Vue Router, this guide will focus on that.

The source code for the tests described on this page can be found [here](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/App.spec.js) and [here](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/NestedRoute.spec.js).

## Creating the Components

We will build a simple `<App>`, that has a `/nested-child` route. Visiting `/nested-child` renders a `<NestedRoute>` component. Create an `App.vue` file, and insert the following minimal component:

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
```

## Creating the Router and Routes

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

## Writing the Test

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

As usual, we start by importing the various modules for the test. Notably, we are importing the actual routes we will be using for the application. This is ideal in some ways - if the real routing breaks, the unit tests should fail, letting us fix the problem before deploying the application.

We can use the same `localVue` for all the `<App>` tests, so it is declared outside the first `describe` block. However, since we might like to have different tests for different routes, the router is defined inside the `it` block.

Another notable point that is different from other guides in this book is we are using `mount` instead of `shallowMount`. If we use `shallowMount`, `<router-link>` will be stubbed out, regardless of the current route, a useless stub component will be rendered.

## Workaround for large render trees using `mount`

Using `mount` is fine in some cases, but sometimes it is not ideal. For example, if you are rendering your entire `<App>` component, chances are the render tree is large, containing many components with their own children components and so on. A lot of children components will trigger various lifecycle hooks, making API requests and the such.

If you are using Jest, its powerful mocking system provides an elegent solution to this problem. You can simply mock the child components, in this case `<NestedRoute>`. The following mock can be used and the above test will still pass:

```js
jest.mock("@/components/NestedRoute.vue", () => ({
  name: "NestedRoute",
  render: h => h("div")
}))
```

## Using a Mock Router

Sometimes a real router is not necessary. Let's update `<NestedRoute>` to show a username based on the current path's query string. This time we will use TDD to implement the feature. Here is a basic test that simply renders the component and makes an assertion:

```js
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

## Strategies for Testing Router Hooks

Vue Router provides several types of router hooks, called ["navigation guards"](https://router.vuejs.org/guide/advanced/navigation-guards.html). Two such examples are:

1. Global guards (`router.beforeEach`). Declared on the router instance.
2. In component guards, such as `beforeRouteEnter`. Declared in components.

Making sure these behave correctly is usually a job for an integration test, since you need to have a user navigate from one route to another. However, you can also use unit tests to see if the functions called in the navigation guards are working correctly and get faster feedback about potential bugs. Here are some strategies on decoupling logic from nagivation guards, and writing unit tests around them.

## Global Guards

Let's say you have a `bustCache` function that should be called on every route that contains the `shouldBustCache` meta field. You routes might look like this:

```js
import NestedRoute from "@/components/NestedRoute.vue"

export default [
  {
    path: "/nested-route",
    component: NestedRoute,
    meta: {
      shouldBustCache: true
    }
  }
]
```

Using the `shouldBustCache` meta field, you want to invalidate the current cache to ensure the user does not get stale data. An implementation might look like this:

```js
import Vue from "vue"
import VueRouter from "vue-router"
import routes from "./routes.js"
import { bustCache } from "./bust-cache.js"

Vue.use(VueRouter)

const router = new VueRouter({ routes })

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.shouldBustCache)) {
    bustCache()
  }
  next()
})

export default router
```

In your unit test, you __could__ import the router instance, and attempt to call `beforeEach` by typing `router.beforeHooks[0]()`. This will throw an error about `next` - since you didn't pass the correct arguments. Instead of this, one strategy is to decouple and independently export the `beforeEach` navigation hook, before coupling it to the router. How about:

```js
export function beforeEach((to, from, next) {
  if (to.matched.some(record => record.meta.shouldBustCache)) {
    bustCache()
  }
  next()
}

router.beforeEach((to, from, next) => beforeEach(to, from, next))

export default router
```

Now writing a test is easy, albeit a little long:

```js
import { beforeEach } from "@/router.js"
import mockModule from "@/bust-cache.js"

jest.mock("@/bust-cache.js", () => ({ bustCache: jest.fn() }))

describe("beforeEach", () => {
  afterEach(() => {
    mockModule.bustCache.mockClear()
  })

  it("busts the cache when going to /user", () => {
    const to = {
      matched: [{ meta: { shouldBustCache: true } }]
    }
    const next = jest.fn()

    beforeEach(to, undefined, next)

    expect(mockModule.bustCache).toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  it("busts the cache when going to /user", () => {
    const to = {
      matched: [{ meta: { shouldBustCache: false } }]
    }
    const next = jest.fn()

    beforeEach(to, undefined, next)

    expect(mockModule.bustCache).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })
})
```

The main point of interest is we mock the entire module using `jest.mock`, and reset the mock using the `afterEach` hook. By exporting the `beforeEach` as a decoupled, regular JavaScript function, it become trivial to test. 

To ensure the hook is actually calling `bustCache` and showing the most recent data, a e2e testing tool like [Cypress.io](https://www.cypress.io/), which comes with applications scaffolded using vue-cli, can be used.

## Component Guards

Component Guards are also easy to test, once you see them as decoupled, regular JavaScript functions. Let's say we added a `beforeRouteLeave` hook to `<NestedRoute>`:

```vue
<script>
import { bustCache } from "@/bust-cache.js"
export default {
  name: "NestedRoute",

  beforeRouteLeave(to, from, next) {
    bustCache()
    next()
  }
}
</script>
```

We can test this in exactly the same way as the global guard:

```js
// ...
import NestedRoute from "@/components/NestedRoute.vue"
import mockModule from "@/bust-cache.js"

jest.mock("@/bust-cache.js", () => ({ bustCache: jest.fn() }))

it("calls bustCache and next when leaving the route", () => {
  const next = jest.fn()
  NestedRoute.beforeRouteLeave(undefined, undefined, next)

  expect(mockModule.bustCache).toHaveBeenCalled()
  expect(next).toHaveBeenCalled()
})
```

While this style of unit test can be  useful for immediate feedback during development, since routers and navigation hooks often interact with several components to achieve some effect, you should also have integration tests to ensure everything is working as expected.

## Conclusion

This guide covered:

- testing components conditionally rendered by Vue Router
- mocking Vue components using `jest.mock` and `localVue`
- decoupling global navigation guards from the router and testing the independently
- using `jest.mock` to mock a module

The source code for the test described on this page can be found [here](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/App.spec.js) and [here](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/NestedRoute.spec.js).
