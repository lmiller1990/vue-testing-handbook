## コンポーネントをレンダーする二つのメソッド - `mount`と`shallowMount`
`vue-test-utils`は、 コンポーネントをレンダー(__マウント__)するのに、二つのメソッドを提供しています - `mount`と`shallowMount`。どのコンポーネントも、この二つのいずれかのメソッドを使い、`wrapper`を返します。`wrapper`は、Vue componentを含むオブジェクトです。また、テストの実行に色々な便利なメソッドを持っています。

それでは、`Child`と`Parent`、二つシンプルなコンポーネントで例を見てみましょう：

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

`Child`をレンダーし、`vue-test-utils`が提供するメソッド`html`を呼び出し、出力しましょう。

```js
const shallowWrapper = shallowMount(Child)
const mountWrapper = mount(Child)

console.log(shallowWrapper.html())
console.log(mountWrapper.html())
```

`mountWrapper.html()`と`shallowWrapper.html()`、両方も下記のように出力されます。


```html
<div>Child component</div>
```

特に差がありません。では、`Parent`の場合はどうなるでしょうか？

```js
const shallowWrapper = shallowMount(Parent)
const mountWrapper = mount(Parent)

console.log(shallowWrapper.html())
console.log(mountWrapper.html())
```

`mountWrapper.html()`は下記のように出力されます:

```html
<div><div>Child component</div></div>
```

`Parent` と`Child`のマークアップはそのまま出力されます。

その一方、`shallowWrapper.html()`は下記のようになります。

```html
<div><vuecomponent-stub></vuecomponent-stub></div>
```

`<Child />`は`<vuecomponent-stub />`になっています。`shallowMount` は通常のhtml要素をレンダーしますが、Vue componentsに対しては描画せずスタブに置き換えることが分かりました。

> スタブとは、実際のオブジェクトを代替する「偽物」のオブジェクトです。

スタブは便利そうですね。以下の`App.vue`コンポーネントをテストすることを考えましょう:

```vue
<template>
  <h1>My Vue App</h1>
  <fetch-data />
</template>
```

`<h1>My Vue App</h1>`が正確にレンダーされたかテストしたいとします。ただ、`<fetch-data />`子コンポーネントもあるので、これは`mounted`ライフサイクルフックの中に、外部APIにリクエストを投げて、レンダーされます。

`mount`を使った場合、ただ一部の内容だけレンダーしたいとしても、`<fetch-data />`は外部APIにリクエストを投げます。その結果、テストが遅くなり、エラーも発生しやすくなります。`shallowMount`を使った場合ですと、`<fetch-data />`は`<vuecomponent-stub />`に置き換えます。スタブは外部依存しないため、APIは呼ばれない。テストがより早くできます。
