## Basic of propsData

`propsData` can be used with both `mount` and `shallowMount`. It is often used to test components that receive props from their parent component.

`propsData` is passed into the second argument of the either `shallowMount` or `mount`, in the following form:

```js
const wrapper = shallowMount(Foo, {
  propsData: {
    foo: 'bar'
  }
})
```

## Creating the component and test

### SubmitButton.vue

Create a simple component that has two `props`:

```html
<template>
  <div>
    <span v-if="isAdmin">Admin Privledges</span>
    <span v-else>Not Authorized</span>
    <button>
      {{ msg }}
    </button>
  </div>
</template>

<script>
export default {
  name: "SubmitButton",

  props: {
    msg: {
      type: String,
      required: true
    },
    isAdmin: {
      type: Boolean,
      default: false
    }
  }
}
</script>
```

### The first test

We will make an assertion on the message in the case the user does not have admin privledges.

```js
import { shallowMount } from '@vue/test-utils'
import SubmitButton from '@/components/SubmitButton.vue'

describe('SubmitButton.vue', () => {
  it("displays a non authorized message", () => {
    const msg = "submit"
    const wrapper = shallowMount(SubmitButton,{
      propsData: {
        msg: msg
      }
    })

    console.log(wrapper.html())

    expect(wrapper.find("span").text()).toBe("Not Authorized")
    expect(wrapper.find("button").text()).toBe("submit")
  })
})
```

Run the tests with `yarn test:unit`. The result is:

```
PASS  tests/unit/SubmitButton.spec.js
  SubmitButton.vue
    ✓ displays a non authorized message (15ms)
```

The result of `console.log(wrapper.html())` is also printed:

```html
<div>
  <span>Not Authorized</span>
  <button>
    send
  </button>
</div>
```

We can see the `msg` prop is processed and the resulting markup is correctly rendered.

### A second test

Let's make an assertion on the other possible state: when `isAdmin` is `true`:

```js
import { shallowMount } from '@vue/test-utils'
import SubmitButton from '@/components/SubmitButton.vue'

describe('SubmitButton.vue', () => {
  it('displays a admin privledges message', () => {
    const msg = "submit"
    const isAdmin = true
    const wrapper = shallowMount(SubmitButton,{
      propsData: {
        msg,
        isAdmin
      }
    })

    expect(wrapper.find("span").text()).toBe("Admin Privledges")
    expect(wrapper.find("button").text()).toBe("submit")
  })
})
```

Run the test with `yarn test:unit` and check the results:

```shell
PASS  tests/unit/SubmitButton.spec.js
  SubmitButton.vue
    ✓ displays a admin privledges message (4ms)
```

We also outputted the markup with `console.log(wrapper.html())`:

```html
<div>
  <span>Admin Privledges</span>
  <button>
    submit
  </button>
</div>
```
We can see the `isAdmin` prop was used to render correct `<span>` element.

## Refactoring the tests

Let's refactor the tests adhering to the principal "Don't repeat yourself". Since all the tests are passing, we can confidentally refactor. As long are they all still passing after the refactor, we can be sure we did not break anything.

### Factory functions

In both tests we call `shallowMount` then pass a similar `propsData` object. We can refactor this using a factory function. A factory function simply a function that returns an object - it _makes_ objects, thus the name "factory" function.

```js
const msg = "submit"
const factory = (propsData) => {
  return shallowMount(SubmitButton, {
    propsData: {
      msg,
      ...propsData
    }
  })
}
```

The aboce is a function that will `shallowMount` a `SubmitButton` component. We can pass any props to change as the first argument to `factory`. Let's DRY up the test with the factory function.

```js
describe("SubmitButton", () => {
  describe("has admin privledges", ()=> {
    it("renders a message", () => {
      const wrapper = factory()

      expect(wrapper.find("span").text()).toBe("Not Authorized")
      expect(wrapper.find("button").text()).toBe("submit")
    })
  })

  describe("does not have admin privledges", ()=> {
    it("renders a message", () => {
      const wrapper = factory({ isAdmin: true })

      expect(wrapper.find("span").text()).toBe("Admin Privledges")
      expect(wrapper.find("button").text()).toBe("submit")
    })
  })
})
```

Let's run the tests again. Everything is still passing.

```sh
PASS  tests/unit/SubmitButton.spec.js
 SubmitButton
   has admin privledges
     ✓ renders a message (26ms)
   does not have admin privledges
     ✓ renders a message (3ms)
```

Since we have a good test suite, we can now easily and confidently refactor.

## Conclusion

- By passing a `propsData` when mounting a component, you can set the `props` to be used in the test
- Factory functions can be used to DRY you tests
- Intead of `propsData`, you can also use [`setProps`](https://vue-test-utils.vuejs.org/api/wrapper-array/#setprops-props) to set prop values during tests
