## Finding Elements

`vue-test-utils` provides a number of ways to find and assert the presence of html elements or other Vue components using the `find` method. The main use of `find` is asserting a component correctly renders an element or child component.

The source code for the test described on this page can be found [here](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/Parent.spec.js).

## Creating the Components

For this example, we will create a `<Child>` and `<Parent>` and component.

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
import { mount, shallowMount } from "@vue/test-utils"
import Parent from "@/components/Parent.vue"

describe("Parent", () => {
  it("does not render a span", () => {
    const wrapper = shallowMount(Parent)

    expect(wrapper.find("span").isVisible()).toBe(false)
  })
})
```

Since `v-show="showSpan"` defaults to `false`, we expect the found `<span>` element's `isVisible` method to return `false`. The tests passes when run with `yarn test:unit`. Next, a test around the case when `showSpan` is `true`.

```js
it("does render a span", () => {
  const wrapper = shallowMount(Parent, {
    data() {
      return { showSpan: true }
    }
  })

  expect(wrapper.find("span").isVisible()).toBe(true)
})
```

It passes! Much like `isVisible` for `v-show`, `vue-test-utils` provides an `exists` method to be used when testing elements conditionally rendered using `v-if`.

## Finding Components with `name` and `Component`

Finding child components is a little different to finding regular HTML elements. There two main ways to assert the presence of child Vue components:

1. `find(Component)`
2. `find({ name: "ComponentName" })`

These are a bit easier to understand in the context of an example test. Let's start with the `find(Component)` syntax. This requires us to `import` the component, and pass it to the `find` function.

```js
import Child from "@/components/Child.vue"

it("does not render a Child component", () => {
  const wrapper = shallowMount(Parent)

  expect(wrapper.find(Child).exists()).toBe(false)
})
```

The implementation for `find` is quite complex, since it works with the `querySelector` syntax, as well as several other syntaxes. You can see the part of the source that finds children Vue components [here](https://github.com/vuejs/vue-test-utils/blob/dev/packages/test-utils/src/find.js). It basically checks the component's `name` against each child rendered, and then checks the `constructor`, and some other properties. 

As mentioned in the previous paragraph, the `name` property is one of the checks done by `find` when you pass a component. Instead of passing the component, you can simply pass an object with the correct `name` property. This means you do not need to `import` the component. Let's test the case when `<Child>` should be rendered:

```js
it("renders a Child component", () => {
  const wrapper = shallowMount(Parent, {
    data() {
      return { showChild: true }
    }
  })

  expect(wrapper.find({ name: "Child" }).exists()).toBe(true)
})
```

It passes! Using the `name` property can be a little unintuitive, so importing the actual component is an alternative. Another option is to simply add a `class` or `id` and query using the `querySelector` style syntax presented in the first two examples.

## `findAll`

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

We can write a test using `findAll` to assert three `<Child>` components are rendered like this:

```js
it("renders many children", () => {
  const wrapper = shallowMount(ParentWithManyChildren)

  expect(wrapper.findAll(Child).length).toBe(3)
})
```

Running `yarn test:unit` shows the test passes. You can use the `querySelector` syntax with `findAll` as well.

## Conclusion

This page covers:

- using `find` and `findAll` with the `querySelector` syntax
- `isVisible` and `exists`
- using `find` and `findAll` with a component or name as the selector

The source code for the test described on this page can be found [here](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/Parent.spec.js).

