:::tip This book is written for Vue.js 3 and Vue Test Utils v2.
Find the Vue.js 2 version [here](/).
:::

## Reducing Boilerplate in Tests

> This article is available as a screencast on [Vue.js Courses](https://vuejs-course.com/screencasts/reducing-duplication-in-tests). Check it out [here](https://vuejs-course.com/screencasts/reducing-duplication-in-tests).

It is often ideal to start each unit test with a fresh copy of a component. Furthermore, as your apps get larger and more complex, chances are you have a some components with many different props, and possibly a number of third party libraries such as Vuetify, VueRouter and Vuex installed. This can cause your tests to have lots of boilerplate code - that is, code that is not directly related to the test.

This article takes component using Vuex and VueRouter and demonstrates some patterns to help you reduce the amount of setup code for your unit tests.

The source code for the test described on this page can be found [here](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/Posts.spec.js).

## The Posts Component

This is the component we will be testing. It shows a `message` prop, if one is received. It shows a New Post button if the user is authenticated and some posts. Both of the `authenticated` and `posts` objects come from the Vuex store. Finally, it renders are `router-link` component, showing a link to a post.

```vue
<template>
  <div>
    <div id="message" v-if="message">{{ message }}</div>

    <div v-if="authenticated">
      <router-link 
        class="new-post" 
        to="/posts/new"
      >
        New Post
      </router-link>
    </div>

    <h1>Posts</h1>
    <div 
      v-for="post in posts" 
      :key="post.id" 
      class="post"
    >
      <router-link :to="postLink(post.id)">
        {{ post.title }}
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Posts',
  props: {
    message: String,
  },

  computed: {
    authenticated() {
      return this.$store.state.authenticated
    },

    posts() {
      return this.$store.state.posts
    }
  },

  methods: {
    postLink(id) {
      return `/posts/${id}`
    }
  }
}
</script>
```

We want to test:

- is the `message` rendered when a prop is received?
- are the `posts` correctly rendered?
- is the New Post button shown when `authenticated` is `true`, hidden when `false`?

Ideally, the tests should be as concise as possible.

## Vuex/VueRouter Factory Functions

One good step you can take to making apps more testable is export factory functions for Vuex and VueRouter. Often, you will see something like:

```js
// store.js

export default createStore({ ... })

// router.js
export default createRouter({ ... })
```

This is fine for a regular application, but not ideal for testing. If you do this, every time you use the store or router in a test, it will be shared across every other test that also imports it. Ideally, every component should get a fresh copy of the store and router.

One easy way to work around this is by exporting a factory function - a function that returns a new instance of an object. For example:

```js
// store.js
export const store = createStore({ ... })
export const createVuexStore = () => {
  return new createStore({ ... })
}

// router.js
export default createRouter({ ... })
export const createVueRouter = () => {
  return createRouter({ ... })
}
```

Now your main app can do `import { store } from './store.js`, and your tests can get a new copy of the store each time by doing `import { createVuexStore } from './store.js`, then creating and instance with `const store = createStore()`. The same goes for the router. This is what I am doing in the `Posts.vue` example - the store code is found [here](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/src/createStore.js) and the router [here](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/src/createRouter.js).

## The Tests (before refactor)

Now we know what `Posts.vue` and the store and router look like, we can understand what the tests are doing:

```js
import { mount } from '@vue/test-utils'

import Posts from '@/components/Posts.vue'
import { createVueRouter } from '@/createRouter'
import { createVuexStore } from '@/createStore'

describe('Posts.vue', () => {
  it('renders a message if passed', () => {
    const store = createVuexStore()
    const router = createVueRouter()
    const message = 'New content coming soon!'
    const wrapper = mount(Posts, {
      global: {
        plugins: [store, router]
      },
      props: { message },
    })

    expect(wrapper.find("#message").text()).toBe('New content coming soon!')
  })

  it('renders posts', async () => {
    const store = createVuexStore()
    const router = createVueRouter()
    const message = 'New content coming soon!'
    const wrapper = mount(Posts, {
      global: {
        plugins: [store, router]
      },
      props: { message },
    })

    wrapper.vm.$store.commit('ADD_POSTS', [{ id: 1, title: 'Post' }])
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.post').length).toBe(1)
  })
})
```

This does not fully tests all the conditions; it's a minimal example, and enough to get us started. Notice the duplication and repetition - let's get rid of that.

## A Custom `createWrapper` Function

The few lines of each test are the same:

```js
const store = createVuexStore(storeState)
const router = createVueRouter()

return mount(component, {
  global: {
    plugins: [store, router]
  },
  props: { ... }
})
```

Let's fix that with a function called `createWrapper`. It looks something like this:

```js
const createWrapper = () => {
  const store = createStore()
  const router = createRouter()
  return { store, router }
}
```

Now we have encapsulated all the logic in a single function. We return the `store`, and `router` since we need to pass them to the `mount` function. 

If we refactor the first test using `createWrapper`, it looks like this:

```js
it('renders a message if passed', () => {
  const { store, router } = createWrapper()
  const message = 'New content coming soon!'
  const wrapper = mount(Posts, {
    global: {
      plugins: [store, router],
    },
    props: { message },
  })

  expect(wrapper.find("#message").text()).toBe('New content coming soon!')
})
```

Quite a bit more concise. Let's refactor second test, which makes use of the of Vuex store.

```js
it('renders posts', async () => {
  const { store, router } = createWrapper()
  const wrapper = mount(Posts, {
    global: {
      plugins: [store, router],
    }
  })

  wrapper.vm.$store.commit('ADD_POSTS', [{ id: 1, title: 'Post' }])
  await wrapper.vm.$nextTick()

  expect(wrapper.findAll('.post').length).toBe(1)
})
```

## Improving the `createWrapper` function

While the above code is definitely an improvement, comparing this and the previous test, we can notice that about half of the code is still duplicated. Let's address this by updating the `createWrapper` function to handle mounting the component, too.

```js
const createWrapper = (component, options = {}) => {
  const store = createVuexStore()
  const router = createVueRouter()

  return mount(component, {
    global: {
      plugins: [store, router],
    },
    ...options
  })
}
```

Now we can just called `createWrapper` and have a fresh copy of the component, ready for testing. Our tests are very concise now.

```js
it('renders a message if passed', () => {
  const message = 'New content coming soon!'
  const wrapper = createWrapper(Posts, {
    props: { message },
  })

  expect(wrapper.find("#message").text()).toBe('New content coming soon!')
})

it('renders posts', async () => {
  const wrapper = createWrapper(Posts)

  wrapper.vm.$store.commit('ADD_POSTS', [{ id: 1, title: 'Post' }])
  await wrapper.vm.$nextTick()

  expect(wrapper.findAll('.post').length).toBe(1)
})
```

## Setting the Initial Vuex State

The last improvement we can make is to how we populate the Vuex store. In a real application, you store is likely to be complex, and having to `commit` and `dispatch` many different mutations and actions to get your component into the state you want to test is not ideal. We can make a small change to our `createVuexStore` function, which makes it easier to set the initial state:

```js
const createVuexStore = (initialState = {}) => createStore({
  state() {
    return {
        authenticated: false,
        posts: [],
        ...initialState
    },
  },
  mutations: {
    // ...
  }
})
```

Now we can the desired initial state to the `createVuexStore` function via `createWrapper`:

```js
const createWrapper = (component, options = {}, storeState = {}) => {
  const store = createVuexStore(storeState)
  const router = createVueRouter()

  return mount(component, {
    global: {
      plugins: [store, router],
    },
    ...options
  })
}
```

Now our test now can be written as follows:

```js
it('renders posts', async () => {
  const wrapper = createWrapper(Posts, {}, {
    posts: [{ id: 1, title: 'Post' }]
  })

  expect(wrapper.findAll('.post').length).toBe(1)
})
```

This is a big improvement! We went from a test where roughly half the code was boilerplate, and not actually related to the assertion, to two lines; one to prepare the component for testing, and one for the assertion. 

Another bonus of this refactor is we have a flexible `createWrapper` function, which we can use for all our tests.

## Improvements

There are some other potential improvements:

- update the `createVuexStore` function to allow setting initial state for Vuex namespaced modules
- improve `createVueRouter` to set a specific route
- allow the user to pass a `shallow` or `mount` argument to `createWrapper` 

## Conclusion

This guide discussed:

- using factory functions to get a new instance of an object
- reducing boilerplate and duplication by extract common behavior

The source code for the test described on this page can be found [here](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/Posts.spec.js). It is also available as a screencast on [Vue.js Courses](https://vuejs-course.com/screencasts/reducing-duplication-in-tests).
