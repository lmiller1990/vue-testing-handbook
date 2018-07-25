## vue-cli

`vue-test-utils` is the official testing library for Vue, and will be used throughout the guide. It runs in both a browser and Node.js environment, and works with any test runner. We will be running our tests in a Node.js environment throughout this guide.

`vue-cli` is the easiest way to get started. It will set up a project, as well as configure Jest, a popular testing framework. Install it by running:

```sh
yarn global add @vue/cli
```

or with npm:

```sh
npm install -g @vue/cli
```

Create a new project by running `vue create [project-name]`. Choose "Manually select features" and "Unit Testing", and "Jest" for the test runner.

Once the installation finishes, `cd` into the project and run `yarn test:unit`. If everything went well, you should see:

```
 PASS  tests/unit/HelloWorld.spec.js
  HelloWorld.vue
    ✓ renders props.msg when passed (26ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        2.074s
```

Congradulations, you just ran your first passing test!

## Writing your first test

We ran an existing test that came with the project. Let's get our handy dirty, writing our own component, and a test. Traditionally when doing TDD, you write the failing test first, then implement the code which allows the test to pass. For now, we will write the component first.

We don't need `src/components/HelloWorld.vue` or `tests/unit/HelloWorld.spec.js` anymore, so you can delete those.

### Creating the `Greeting` component

Create a `Greeting.vue` file in `src/components`. Inside `Greeting.vue`, add the following:

```vue
<template>
  <div>
    {{ greeting }}
  </div>
</template>

<script>
export default {
  name: "Greeting",

  data() {
    return {
      greeting: "Vue and TDD"
    }
  }
}
</script>
```

### Writing the test

`Greeting` has only one responsibility - to render the `greeting` value. The strategy will be:

1. render the component with `mount`
2. assert that the component's text contains "Vue and TDD"

Create a `Greeting.spec.js` inside `tests/unit`. Inside, import `Greeting.vue`, as well as `mount`, and add the outline of the test:

```
import { mount } from '@vue/test-utils'
import Greeting from '@/components/Greeting.vue'

describe('Greeting.vue', () => {
  it('renders a greeting', () => {

  })
})
```

There are differnet syntaxes used for TDD, we will use the commonly seen `describe` and `it` syntax that comes with Jest. `describe` generally outlines what the test is about, in this case `Greeting.vue`. `it` represents a single piece of responsility that the subject of the test should fulfil. As we add more features to the component, we add more `it` blocks.

Now we should render the component with `mount`. The standard practice it to assign the component to a variable called `wrapper`. We will also print the output, to make sure everything is running correctly:

```js
const wrapper = mount(Greeting)

console.log(wrapper.html())
```

### Running the test

Run the test by typing `yarn test:unit` into your terminal. Any file in the `tests` directory ending with `.spec.js` is automatically executed. If everything went well, you should see:

```
PASS  tests/unit/Greeting.spec.js
Greeting.vue
  ✓ renders a greeting (27ms)

console.log tests/unit/Greeting.spec.js:7
  <div>
    Vue and TDD
  </div>
```

We can see the markup is correct, and the test passes. The test is passing because there was no failure - this test can never fail, so it is very useful yet. Even if we change `Greeting.vue` and delete the `{{ message }}`, it will still pass. Let's change that.

## Making assertions

We need to make an assertion to ensure the component is behaving correctly. We can do that using Jest's `epxect` API. It looks like this: `expect(result).to [matcher] (actual)`. 

_Matchers_ are methods to compare values and objects. For example:

```js
expect(1).toBe(1)
```

A full list of matchers available in the [Jest documentation](http://jestjs.io/docs/en/expect). `vue-test-utils` doesn't include any matchers - the ones Jest provides are more than enough. We want to compare the text from `Greeting`. We could write:

```js
expect(wrapper.html().includes("Vue and TDD").toBe(true)
```

but `vue-test-utils` has an even better way to get the markup - `wrapper.text`. Let's finish the test off:

```js
import { mount } from '@vue/test-utils'
import Greeting from '@/components/Greeting.vue'

describe('Greeting.vue', () => {
  it('renders a greeting', () => {
    const wrapper = mount(Greeting)

    expect(wrapper.text()).toMatch("Vue and TDD")
  })
})
```

We don't need the `console.log` anymore, so you can delete that. Run the tests with `yarn unit:test`, and if everything went well you should get:

```
PASS  tests/unit/Greeting.spec.js
Greeting.vue
  ✓ renders a greeting (15ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        1.477s, estimated 2s
```

Looking good. But you should always see a test fail, then pass, to make sure it's really working. In traditional TDD, you would write the test before the actual implementation, see if fail, the use the failing errors to guide your code. Let's make sure this test is really working. Update `Greeting.vue`:

```vue
<template>
  <div>
    {{ greeting }}
  </div>
</template>

<script>
export default {
  name: "Greeting",

  data() {
    return {
      greeting: "Vue without TDD"
    }
  }
}
</script>
```

And now run the test with `yarn test:unit`:

```
FAIL  tests/unit/Greeting.spec.js
Greeting.vue
  ✕ renders a greeting (24ms)

● Greeting.vue › renders a greeting

  expect(received).toMatch(expected)

  Expected value to match:
    "Vue and TDD"
  Received:
    "Vue without TDD"

     6 |     const wrapper = mount(Greeting)
     7 |
  >  8 |     expect(wrapper.text()).toMatch("Vue and TDD")
       |                            ^
     9 |   })
    10 | })
    11 |

    at Object.<anonymous> (tests/unit/Greeting.spec.js:8:28)
```

Jest gives us good feedback. We can see the expected and actual result, as well as on which line the expectation failed. The test did fail, as expected. Revert `Greeting.vue` and make sure the test is passing again.

Next we will look at the two methods `vue-test-utils` provides to render components - `mount` and `shallowMount`. 
