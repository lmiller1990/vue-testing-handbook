## Two ways to render

`vue-test-utils` provides two ways to render, or __mount__ a component - `mount` and `shallowMount`. A component mounted using either of these methods returns a `wrapper`, which is an object containing the Vue component, plus some useful methods for testing.

Let's start off with two simple components:

```js
const Child = Vue.component("Child", {
  name: "Child",

  template: "<div>Child component</div>"
})

const Parent = Vue.component("Parent", {
  name: "Parent",

  template: "<div><child /></div>"
})
```

Let's start off by rendering `Child` and calling the `html` method `vue-test-utils` provides to inspect the markup.

```js
const shallowWrapper = shallowMount(Child)
const mountWrapper = mount(Child)

console.log(shallowWrapper.html())
console.log(mountWrapper.html())
```

Both `mountWrapper.html()` and `shallowWrapper.html()` yield the following output:

```html
<div>Child component</div>
```

No difference here. How about with `Parent`?

```js
const shallowWrapper = shallowMount(Parent)
const mountWrapper = mount(Parent)

console.log(shallowWrapper.html())
console.log(mountWrapper.html())
```

`mountWrapper.html()` now yields:

```html
<div><div>Child component</div></div>
```

Which is the completely rendered markup of `Parent` and `Child`. `shallowWrapper.html()`, on the other hand, produces this:

```html
<div><vuecomponent-stub></vuecomponent-stub></div>
```

The place where `<Child />` should be has been replaced by `<vuecomponent-stub />`. `shallowMount` renders regular html elements, but replaces Vue components with a stub.

> A stub is kind of a "fake" object that stands in for a real one.

This can be useful. Imagine you want to test your `App.vue` component, that looks like this:

```vue
<template>
  <div>
    <h1>My Vue App</h1>
    <fetch-data />
  </div>
</template>
```

And we want to test `<h1>My Vue App</h1>`  is rendered correctly. We also have a `<fetch-data>` component, that makes a request to an external API in its `mounted` lifecycle hook. 

If we use `mount`, although all we want to do is assert some text is rendered, `<fetch-data />` will make an API request. This will make our test slow and prone to failure. So, we stub out external dependencies. By using `shallowMount`, `<fetch-data />` will be replaced with a `<vuecomponent-stub />`, and the API call will not be initiated.
