## Components with props

Talk about


### `propsData`の基本的な使い方

`propsData` は基本的に `mount` や `shallowMount` とともに使うことができ、 `propsData` は親コンポーネントから `props` として渡されたものとしてテストで使用できます。

第二引数のオブジェクトの中に書くことができますが、基本的な書き方は次の通りです：

```js
const wrapper = shallowMount(Foo, {
  propsData: {
    foo: 'bar'
  }
})
```

### A tip of `propsData`: factory関数を作ろう

同じコンポーネントのテストをしていると何度も `mount` して `propsData` を書くと思いますが、どうやってその回数を減らせるかについて書いて行きたいと思います。

#### Bad

```js
it("Test 1", ()=> {
  const wrapper = shallowMount(Foo, {
    propsData: {
      foo: "bar",
      msg: "Test 1"
    }
  })
})

it("Test 2", ()=> {
  const wrapper = shallowMount(Foo, {
    propsData: {
      foo: "bar",
      msg: "Test 2",
      hoge: true
    }
  })
})
```

#### Good

```js
const factory = (propsData) => {
  return shallowMount(Component, {
    propsData: {
      foo: "bar",
      ...propsData
    }
  })
}

it("Test 1", ()=> {
  const wrapper = factory({ qux: "hoge" })
})

it("Test 2", ()=> {
  const wrapper = factory({ msg: "Test 2", hoge: true })
})
```

何度も作成するコンポーネントのwapperは、factory関数を作ってあげるととてもシンプルにテストがかけるようになります。

### 実際にコンポーネントを作成してみよう


This is creating componets parts by TDD 

