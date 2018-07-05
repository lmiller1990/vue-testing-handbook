## Testing Computed Properties

Testing computed properties are especially simple, since they are just plain old JavaScript functions.

Let's start with looking at two different ways to test a `computed` property. We will develop a `<NumberRenderer>` component, that renders either odd or even numbers, based on a `numbers` computed property. 

### Writing the test

The `<NumberRenderer>` component will receive an `even` prop, that is a boolean. If `even` is `true`, the component should render 2, 4, 6, and 8. If `false`, it should render 1, 3, 5, 7 and 9. The list of values will be calculated in a `computed` property called `numbers`.

### Testing by rendering the value

The test:

```js
import { shallowMount } from "@vue/test-utils"
import NumberRenderer from "@/components/NumberRenderer.vue"

describe("NumberRenderer", () => {
  it("renders even numbers", () => {
    const wrapper = shallowMount(NumberRenderer, {
      propsData: {
        even: true
      }
    })

    expect(wrapper.text()).toBe("2, 4, 6, 8")
  })
})
```

Before running the test, let's set up `<NumberRenderer>`:

```
<template>
  <div>
  </div>
</template>

<script>
export default {
  name: "NumberRenderer",

  props: {
    even: {
      type: Boolean,
      required: true
    }
  }
}
</script>
```

Now we start development, and let the error messages guide our implementation. `yarn test:unit` yields:

```
● NumberRenderer › renders even numbers

  expect(received).toBe(expected) // Object.is equality

  Expected: "2, 4, 6, 8"
  Received: ""
```

It looks like everything is hooked up correctly. Let's start implementing `numbers`:

```js
computed: {
  numbers() {
    const evens = []

    for (let i = 1; i < 10; i++) {
      if (i % 2 === 0) {
        evens.push(i)
      }
    }

    return evens
  }
}
```

And update the template to use the new computed property:

```html
<template>
  <div>
    {{ numbers }}
  </div>
</template>
```

`yarn test:unit` now yields:

```
FAIL  tests/unit/NumberRenderer.spec.js
● NumberRenderer › renders even numbers

  expect(received).toBe(expected) // Object.is equality

  Expected: "2, 4, 6, 8"
  Received: "[
    2,
    4,
    6,
    8
  ]"
```

The numbers are correct, but we want to render the list formatted nicely. Let's update the `return` value:

```js
return evens.join(", ")
```

Now `yarn test:unit` passes! 

### Testing with `call` 

We will now add a test for the case of `even: false`. This time, we will see an alternative way to test a computed property, without actually rendering the component.

The test, first:

```js
it("renders odd numbers", () => {
  const localThis = { even: false }

  expect(NumberRenderer.computed.numbers.call(localThis)).toBe("1, 3, 5, 7, 9")
})
```

Instead of rendering the component and making an assertion on `wrapper.text()`, we are using `call` to provide alternative `this` context to `numbers`. We will see what happens if we don't use call after we get the test to pass.

Running the current test yields:

```
FAIL  tests/unit/NumberRenderer.spec.js
● NumberRenderer › renders odd numbers

  expect(received).toBe(expected) // Object.is equality

  Expected: "1, 3, 5, 7, 9"
  Received: "2, 4, 6, 8"
```

Update `numbers`:


```js
numbers() {
  const evens = []
  const odds = []

  for (let i = 1; i < 10; i++) {
    if (i % 2 === 0) {
      evens.push(i)
    } else {
      odds.push(i)
    }
  }

  return this.even === true ? evens.join(", ") : odds.join(", ")
}
```

Now both tests pass! But what if we hadn't used `call` in the second test? Try updating it like so:

```js
it("renders odd numbers", () => {
  const localThis = { even: false }

  expect(NumberRenderer.computed.numbers()).toBe("1, 3, 5, 7, 9")
})
```

The test now fails:

```
FAIL  tests/unit/NumberRenderer.spec.js
● NumberRenderer › renders odd numbers

  expect(received).toBe(expected) // Object.is equality

  Expected: "1, 3, 5, 7, 9"
  Received: "2, 4, 6, 8"
```

`vue` automatically binds `props` to `this`. We are not rendering the component with `mount`, though, so Vue isn't binding anything to `this`. If you do `console.log(this)`, you can see the context is simply the `computed` object:

```
{ numbers: [Function: numbers] }
```

So we need to use `call`, which lets us bind an alternative `this` object, in our case, one with a `even` property.

### To `call` or to `shallowMount`?

Both techniques presented are useful for testing computed properties. If you are testing a component that does some time consuming operations in a lifecycle methods you would like to avoid executing in your computed unit test, or you want to stub out some values, using `call` and passing a custom context can be useful. Of course, you want to make sure the value is correctly rendered as well, so make sure you choose the correct technique when testing your computed properties, and test all the edge cases.
