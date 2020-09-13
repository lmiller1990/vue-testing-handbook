:::tip This book is written for Vue.js 2 and Vue Test Utils v1.
Find the Vue.js 3 version [here](/v3/).
:::

## Testing getters

Testing getters in isolation is straight forward, since they are basically just JavaScript functions. The techniques are similar to testing mutations, more info [here](https://lmiller1990.github.io/vue-testing-handbook/vuex-mutations.html), and actions. 

The source code for the test described on this page can be found [here](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/getters.spec.js).

We will look at two getters, which operate on a store that looks like this:

```js
const state = {
  dogs: [
    { name: "lucky", breed: "poodle", age: 1 },
    { name: "pochy", breed: "dalmatian", age: 2 },
    { name: "blackie", breed: "poodle", age: 4 }
  ]
}
```

The getters we will test are:

1. `poodles`: gets all `poodles`
2. `poodlesByAge`: gets all poodles, and accepts an age argument

## Creating the Getters

First, let's create the getters. 

```js
export default {
  poodles: (state) => {
    return state.dogs.filter(dog => dog.breed === "poodle")
  },

  poodlesByAge: (state, getters) => (age) => {
    return getters.poodles.filter(dog => dog.age === age)
  }
}
```

Nothing too exciting - remember that getters receive other getters as the second argument. Since we already have a `poodles` getter, we can use that in `poodlesByAge`. By returning a function in `poodlesByAge` that takes an argument, we can pass arguments to getters. The `poodlesByAge` getter can be used like this:

```js
computed: {
  puppies() {
    return this.$store.getters.poodlesByAge(1)
  }
}
```

Let's start with a test for `poodles`.

## Writing the Tests

Since a getter is just a JavaScript function that takes a `state` object as the first argument, the test is very simple. I'll write my test in a `getters.spec.js` file, with the following code:

```js
import getters from "../../src/store/getters.js"

const dogs = [
  { name: "lucky", breed: "poodle", age: 1 },
  { name: "pochy", breed: "dalmatian", age: 2 },
  { name: "blackie", breed: "poodle", age: 4 }
]
const state = { dogs }

describe("poodles", () => {
  it("returns poodles", () => {
    const actual = getters.poodles(state)

    expect(actual).toEqual([ dogs[0], dogs[2] ])
  })
})
```

Vuex automatically passes the `state` to the getter. Since we are testing the getters in isolation, we have to manually pass the `state`. Other than that, we are just testing a regular JavaScript function.

`poodlesByAge` is a bit more interesting. The second argument to a getter is other `getters`. We are testing `poodlesByAge`, so we don't want to involve the implementation of `poodles`. Instead, we can stub `getters.poodles`. This will give us more fine grained control over the test.

```js
describe("poodlesByAge", () => {
  it("returns poodles by age", () => {
    const poodles = [ dogs[0], dogs[2] ]
    const actual = getters.poodlesByAge(state, { poodles })(1)

    expect(actual).toEqual([ dogs[0] ])
  })
})
```

Instead of actually passing the real `poodles` getter, we pass in the result it would return. We already know it is working, since we wrote a test for it. This allows us to focus on testing the logic unique to `poodlesByAge`.

It is possible to have `async` getters. They can be tested using the same technique as `async` actions, which you can read about [here](https://lmiller1990.github.io/vue-testing-handbook/vuex-actions.html).

## Conclusion

- `getters` are just plain JavaScript functions.
- When testing `getters` in isolation, you need to pass the state manually.
- If a getter uses another getter, you should stub the expected return result of the first getter. This will give you more fine grained control over the test, and let you focus on testing the getter in question

The source code for the test described on this page can be found [here](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/getters.spec.js).
