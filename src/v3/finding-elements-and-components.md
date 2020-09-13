:::tip This book is written for Vue.js 3 and Vue Test Utils v2.
Find the Vue.js 2 version [here](/).
:::

## Finding Elements

`vue-test-utils` provides a number of ways to find and assert the presence of html elements or other Vue components using the `find` and `findComponent` methods. The main use of `find` is asserting a component correctly renders an element or child component.

> Note: If you used Vue Test Utils prior to v1, you may remember `find` working with components as well as DOM elements. Now you use `find` and `findAll` for DOM elements, and `findComponent` and `findAllComponents` for Vue components. Ther is also a `get` and `getComponent` pair, which are exactly the same as `find` and `findComponent`, but they will raise an error if they do not find anything. This guide chooses to use `find` and `findComponent`.

The source code for the test described on this page can be found [here](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app-vue-3/tests/unit/Parent.spec.js).

## Creating the Components

For this example, we will create a `<Child>` and `<Parent>` component.

Child: 

```vue
<template>
  <div>Child</div>
</template>

<script>
export default {
  name: "Child"
}
</script>
```

Parent:

```vue
<template>
  <div>
    <span v-show="showSpan">
      Parent Component
    </span>
    <Child v-if="showChild" />
  </div>
</template>

<script>
import Child from "./Child.vue"

export default {
  name: "Parent",

  components: { Child },

  data() {
    return {
      showSpan: false,
      showChild: false
    }
  }
}
</script>
```

## `find` with `querySelector` syntax

Regular elements can easily be selected using the syntax used with `document.querySelector`. `vue-test-utils` also provides a `isVisible` method to check if elements conditionally rendered with `v-show` are visible. Create a `Parent.spec.js`, and inside add the following test:

```js
import { mount } from "@vue/test-utils"
import '@testing-library/jest-dom'
import Parent from "@/components/Parent.vue"

describe("Parent", () => {
  it("does not render a span", () => {
    const wrapper = mount(Parent)

    expect(wrapper.find("span").element).not.toBeVisible()
  })
})
```

Since `v-show="showSpan"` defaults to `false`, we expect the found `<span>` element's not to be visible. We are using the awesome `@testing-library/jest-dom` matchers to validate this - determining visibility is tricky business, so Vue Test Utils leaves it up to another battle tested library. The tests passes when run with `yarn test:unit`. Next, a test around the case when `showSpan` is `true`.

```js
it("does render a span", () => {
  const wrapper = mount(Parent, {
    data() {
      return { showSpan: true }
    }
  })

  expect(wrapper.find("span").element).toBeVisible()
})
```

It passes!

## Finding Components with `name` and `Component`

Finding child components is a little different to finding regular HTML elements. There two main ways to assert the presence of child Vue components:

1. `findComponent(Component)`
2. `findComponent({ name: "ComponentName" })`

These are a bit easier to understand in the context of an example test. Let's start with the `findComponent(Component)` syntax. This requires us to `import` the component, and pass it to the `findComponent` function.

```js
import Child from "@/components/Child.vue"

it("does not render a Child component", () => {
  const wrapper = mount(Parent)

  expect(wrapper.findComponent(Child).exists()).toBe(false)
})
```

The implementation for `find` and `findComponent` is quite complex, since it works with the `querySelector` for DOM elements, as well as several other syntaxes for Vue components. You can see the part of the source that finds children Vue components [here](https://github.com/vuejs/vue-test-utils/blob/dev/packages/test-utils/src/find.js). It basically checks the component's `name` against each child rendered, and then checks the `constructor`, and some other properties. 

As mentioned in the previous paragraph, the `name` property is one of the checks done by `find` when you pass a component. Instead of passing the component, you can simply pass an object with the correct `name` property. This means you do not need to `import` the component. Let's test the case when `<Child>` should be rendered:

```js
it("renders a Child component", () => {
  const wrapper = mount(Parent, {
    data() {
      return { showChild: true }
    }
  })

  expect(wrapper.findComponent({ name: "Child" }).exists()).toBe(true)
})
```

It passes! Using the `name` property can be a little unintuitive, so importing the actual component is an alternative. Another option is to simply add a `class` or `id` and query using the `querySelector` style syntax presented in the first two examples.

## `findAll` and `findAllComponents`

There are often cases when you want to assert that a number of elements are rendered. A common case is a list of items rendered with `v-for`. Here is a `<ParentWithManyChildren>` that renders several `<Child>` components.

```js
<template>
  <div>
    <Child v-for="id in [1, 2 ,3]" :key="id" />
  </div>
</template>

<script>
import Child from "./Child.vue"

export default {
  name: "ParentWithManyChildren",

  components: { Child }
}
</script>
```

We can write a test using `findAllComponents` to assert three `<Child>` components are rendered like this:

```js
it("renders many children", () => {
  const wrapper = mount(ParentWithManyChildren)

  expect(wrapper.findAllComponents(Child).length).toBe(3)
})
```

Running `yarn test:unit` shows the test passes. You can use the `querySelector` syntax with `findAll` as well.

## Conclusion

This page covers:

- using `find` and `findAll` with the `querySelector` syntax for DOM elements
- use `findComponent` and `findAllComponents` for Vue components
- use `exists` to check if something is present, `toBeVisible` from `@testing-library/jest-dom` to see if something is present but not visible 

The source code for the test described on this page can be found [here](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app-vue-3/tests/unit/Parent.spec.js).

