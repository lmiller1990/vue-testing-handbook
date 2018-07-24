## コンポーネントのレンダリング - 二つの方法
`vue-test-utils`はコンポーネントのレンダリング(__マウント__)に二つの方法を提供しています - `mount`と`shallowMount`。マウントされたコンポーネントはいずれもこの二つの方法を使い、`wrapper`を返します。`wrapper`は、Vue componentを含むオブジェクトです。また、テストを実行するに色々な便利なメソッドを持っています。

それでは、二つシンプルなコンポーネントを使って、例を見てみましょう：

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

`Child`をレンダリングし、`vue-test-utils`が提供するメソッド`html`を呼び出して、マークアップを出力しましょう。

```js
const shallowWrapper = shallowMount(Child)
const mountWrapper = mount(Child)

console.log(shallowWrapper.html())
console.log(mountWrapper.html())
```

`mountWrapper.html()`と`shallowWrapper.html()`は両方

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

Which is the completely rendered markup of `Parent` and `Child`. `mountWrapper.html()`, on the other hand, produces this:

```html
<div><vuecomponent-stub></vuecomponent-stub></div>
```

The place where `<Child />` should be has been replaced by `vuecomponent-stub />`. `shallowMount` renders regular html elements, but replaces Vue components with a stub.

> A stub is kind of "fake" an object that stands in for a real one.

This can be useful. Imagine you want to test your `App.vue` component, that looks like this:

```vue
<template>
  <h1>My Vue App</h1>
  <fetch-data />
</template>
```

And we want to test `<h1>My Vue App</h1>`  is rendered correctly. We also have a `<fetch-data>` component, that makes a request to an external API in it's `mounted` lifecycle hook. 

If we use `mount`, although all we want to do is asset some text is rendered, `<fetch-data />` will make an API request. This will make out test slow and prone to failure. So, stub out external dependencies. By using `shallowMount`, `<fetch-data />` will be replaced with a `<vuecomponent-stub />`, and the API call will not be initiated.
