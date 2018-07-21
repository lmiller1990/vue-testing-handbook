### Testing Mutations

Testing mutations in isolation is very straight forward, because mutations are just regular JavaScript functions. This page discusses testing mutations in isolation. If you want to test mutations in the context of a component committing a mutation, see [here](https://lmiller1990.github.io/vue-testing-handbook/vuex-in-components-mutations-and-actions.html).

The test used in the following example can be found [here](https://github.com/lmiller1990/vue-testing-handbook/blob/master/demo-app/tests/unit/mutations.spec.js).

### Creating the Mutation

Mutations tend to following a set pattern. Get some data, maybe do some processing, then assign the data to the state. Here is the outline of an `ADD_POST` mutation. Once implemented, it will receive a `post` object in the payload, and add the `post.id` to `state.postIds`. It will also add the post object to the `state.posts` object, where the key is the `post.id`. This is a common pattern in apps using Vuex.

We will develop it using TDD. The start of the mutation is as follows:

```js
export default {
  SET_USER(state, { post }) {

  }
}
```

Let's write the test, and let the error messages guide our development:

```js
import mutations from "@/store/mutations.js"

describe("SET_POST", () => {
  it("adds a post to the state", () => {
    const post = { id: 1, title: "Post" }
    const state = {
      postIds: [],
      posts: {}
    }

    mutations.SET_POST(state, { post })

    expect(state).toEqual({
      postIds: [1],
      posts: { "1": post }
    })
  })
})
```

Running this test with `yarn test:unit` yields the following failure message:

```
FAIL  tests/unit/mutations.spec.js
● SET_POST › adds a post to the state

  expect(received).toEqual(expected)

  Expected value to equal:
    {"postIds": [1], "posts": {"1": {"id": 1, "title": "Post"}}}
  Received:
    {"postIds": [], "posts": {}}
```

Let's start by adding the `post.id` to `state.postIds`:

```js
export default {
  SET_POST(state, { post }) {
    state.postIds.push(post.id)
  }
}
```

Now `yarn test:unit` yields:

```
Expected value to equal:
  {"postIds": [1], "posts": {"1": {"id": 1, "title": "Post"}}}
Received:
  {"postIds": [1], "posts": {}}
```

`postIds` looks good. Now we just need to add the post to `state.posts`. Because of how the Vue reactivity system works we cannot simply write `post[post.id] = post` to add the post. More details can be found [here](https://vuejs.org/v2/guide/reactivity.html#Change-Detection-Caveats). Basically, you need to create a new object using `Object.assign` or the `...` operator. We will use the `...` operator to assign the post to `state.posts`:

```js
export default {
  SET_POST(state, { post }) {
    state.postIds.push(post.id)
    state.posts = { ...state.posts, [post.id]: post }
  }
}
```

Now the test passes!

### Conclusion

Testing Vuex mutations requires nothing specific to Vue or Vuex, since they are just regular JavaScript functions. Simply import them and test as needed. The only thing to be careful of is Vue's reactivity caveats, which apply to Vuex as well. You can read more about the reactivity system and common caveats [here](https://vuejs.org/v2/guide/reactivity.html#Change-Detection-Caveats).

The page discussed:

- Vuex mutations are regular JavaScript functions
- Mutations can, and should, be tested in isolation from the main Vue app

The test used in the above example can be found [here](https://github.com/lmiller1990/vue-testing-handbook/blob/master/demo-app/tests/unit/mutations.spec.js).
