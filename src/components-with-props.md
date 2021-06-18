:::tip This book is written for Vue.js 2 and Vue Test Utils v1.
Find the Vue.js 3 version [here](/v3/).
:::

## Setting props with propsData

`propsData` can be used with both `mount` and `shallowMount`. It is often used to test components that receive props from their parent component.

`propsData` is passed into the second argument of either `shallowMount` or `mount`, in the following form:

```js
const wrapper = mount(Foo, {
  propsData: {
    foo: 'bar'
  }
})
```

## Creating the component

Create a simple `<SubmitButton>` component that has two `props`: `msg` and `isAdmin`. Depending on the value of the `isAdmin` prop this component will contain a `<span>` in one of two states:

* `Not Authorized` if `isAdmin` is false (or not passed as a prop)
* `Admin Privileges` if `isAdmin` is true

```html
<template>
  <div>
    <span v-if="isAdmin">Admin Privileges</span>
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

## The First Test

We will make an assertion on the message in the case the user does not have admin privileges.

```js
import { mount } from '@vue/test-utils'
import SubmitButton from '@/components/SubmitButton.vue'

describe('SubmitButton.vue', () => {
  it("displays a non authorized message", () => {
    const msg = "submit"
    const wrapper = mount(SubmitButton,{
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
    submit
  </button>
</div>
```

We can see the `msg` prop is processed and the resulting markup is correctly rendered.

## A Second Test

Let's make an assertion on the other possible state, when `isAdmin` is `true`:

```js
import { mount } from '@vue/test-utils'
import SubmitButton from '@/components/SubmitButton.vue'

describe('SubmitButton.vue', () => {
  it('displays a admin privileges message', () => {
    const msg = "submit"
    const isAdmin = true
    const wrapper = mount(SubmitButton,{
      propsData: {
        msg,
        isAdmin
      }
    })

    console.log(wrapper.html())
    
    expect(wrapper.find("span").text()).toBe("Admin Privileges")
    expect(wrapper.find("button").text()).toBe("submit")
  })
})
```

Run the test with `yarn test:unit` and check the results:

```shell
PASS  tests/unit/SubmitButton.spec.js
  SubmitButton.vue
    ✓ displays a admin privileges message (4ms)
```

We also outputted the markup with `console.log(wrapper.html())`:

```html
<div>
  <span>Admin Privileges</span>
  <button>
    submit
  </button>
</div>
```
We can see the `isAdmin` prop was used to render the correct `<span>` element.

## Refactoring the tests

Let's refactor the tests adhering to the principle "Don't Repeat Yourself" (DRY). Since all the tests are passing, we can confidently refactor. As long as the tests all still pass after the refactor, we can be sure we did not break anything.

## Refactor with a Factory Function

In both tests we call `mount` then pass a similar `propsData` object. We can refactor this using a factory function. A factory function is simply a function that returns an object - it _makes_ objects, thus the name "factory" function.

```js
const msg = "submit"
const factory = (propsData) => {
  return mount(SubmitButton, {
    propsData: {
      msg,
      ...propsData
    }
  })
}
```

The above is a function that will `mount` a `SubmitButton` component. We can pass any props to change as the first argument to `factory`. Let's DRY up the test with the factory function.

```js
describe("SubmitButton", () => {
  describe("does not have admin privileges", ()=> {
    it("renders a message", () => {
      const wrapper = factory()

      expect(wrapper.find("span").text()).toBe("Not Authorized")
      expect(wrapper.find("button").text()).toBe("submit")
    })
  })

  describe("has admin privileges", ()=> {
    it("renders a message", () => {
      const wrapper = factory({ isAdmin: true })

      expect(wrapper.find("span").text()).toBe("Admin Privileges")
      expect(wrapper.find("button").text()).toBe("submit")
    })
  })
})
```

Let's run the tests again. Everything is still passing.

```sh
PASS  tests/unit/SubmitButton.spec.js
 SubmitButton
   has admin privileges
     ✓ renders a message (26ms)
   does not have admin privileges
     ✓ renders a message (3ms)
```

Since we have a good test suite, we can now easily and confidently refactor.

## Conclusion

- By passing `propsData` when mounting a component, you can set the `props` to be used in the test
- Factory functions can be used to DRY your tests
- Instead of `propsData`, you can also use [`setProps`](https://vue-test-utils.vuejs.org/api/wrapper-array/#setprops) to set prop values during tests
