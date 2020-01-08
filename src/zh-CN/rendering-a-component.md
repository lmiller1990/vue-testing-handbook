## 两种渲染方式

`vue-test-utils` 提供了两种方式用于渲染，或者说 __加载（mount）__ 一个组件 -- `mount` 和 `shallowMount`。一个组件无论使用这两种方法的哪个都会返回一个 `wrapper`，也就是一个包含了 Vue 组件的对象，辅以一些对测试有用的方法。

让我们从两个简单的组件开始：

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
先来渲染 `Child` 并调用由 `vue-test-utils` 提供的用以核查置标语言的 `html` 方法。

```js
const shallowWrapper = shallowMount(Child)
const mountWrapper = mount(Child)

console.log(shallowWrapper.html())
console.log(mountWrapper.html())
```

`mountWrapper.html()` 和 `shallowWrapper.html()` 都产生了如下输出：

```html
<div>Child component</div>
```

此次并没有差别。换作 `Parent` 又如何呢？

```js
const shallowWrapper = shallowMount(Parent)
const mountWrapper = mount(Parent)

console.log(shallowWrapper.html())
console.log(mountWrapper.html())
```

`mountWrapper.html()` 现在产生了：

```html
<div><div>Child component</div></div>
```

这完整地渲染了 `Parent` 和 `Child` 的标记。而 `shallowWrapper.html()` 产生了如下输出：

```html
<div><vuecomponent-stub></vuecomponent-stub></div>
```

原本 `<Child />` 应该出现的地方被替换成了 `<vuecomponent-stub />`。`shallowMount` 会渲染常规的 HTML 元素，但将用 stub 替换掉 Vue 组件。

> 一个 stub 就是一种替代真实组件的 “假的” 对象

这会很管用。想象一下要测试你的 `App.vue` 组件，看起来是这样的：

```vue
<template>
  <div>
    <h1>My Vue App</h1>
    <fetch-data />
  </div>
</template>
```

并且我们只想测试 `<h1>My Vue App</h1>`  被正确地渲染了。但同时我们也有一个 `<fetch-data>` 组件，该组件在其 `mounted` 生命周期钩子中向外部 API 发起一个请求。 

如果我们用了 `mount`，尽管我们只想断言一些文本被渲染，但 `<fetch-data />` 也将发起 API 请求。这将拖慢测试并容易出错。所以，我们 stub 掉外部依赖。通过使用 `shallowMount`，`<fetch-data />` 将会被替换为一个 `<vuecomponent-stub />`，并且 API 调用也不会被初始化了。
