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

さて今までの知識を使ってTDDでコンポーネントを作成していきましょう。

#### 1st example

ColorButton.vue

```html
<template>
  <button>
    {{ msg }}
  </button>
</template>

<script>
export default {
  name: "ColorButton",

  props: {
    msg: {
      type: String,
      required: true
    },
    color: {
      type: String,
      default: "#00A4AC"
    }
  }
}
</script>
```

ColorButton.spec.js

```js
import { shallowMount } from '@vue/test-utils'
import ColorButton from '@/components/ColorButton.vue'

describe('Greeting.vue', () => {
  it('renders a msg', () => {
    const wrapper = shallowMount(ColorButton,{
      propsData: {
        msg: "Button text"
      }
    })

    console.log(wrapper.html())

    expect(wrapper.find("button").text()).toBe("Button text")
  })
})
```

console.logの出力結果

```html
<button>
  Button text
</button>
```

`props` で渡された `msg` がきちんと描画されていることがわかります。

#### 2nd example
色のテストをしたかったけどバグがあるかもなのでテストしない

```html
<template>
  <button
    :style="{ color: color }"
  >
    {{ msg }}
  </button>
</template>
```

```js
it('renders a text with color', () => {
  const msg = "Button text"
  const wrapper = shallowMount(ColorButton,{
    propsData: {
      msg
    }
  })

  // how to test this
})
```

#### 3rd example リファクタリング factory function

```js
describe('Greeting.vue', () => {
  const fuctory = (propsData) => {
    shallowMount(ColorButton,{
      propsData: {
        msg: "Button text"
      }
    })
  }

  it('renders a msg', () => {
    const wrapper = fuctory()

    expect(wrapper.find("button").text()).toBe("Button text")
  })

  it('renders a text with color', () => {
    const wrapper = fuctory()

    expect(wrapper.find("button")).toBe(msg)
  })
})
```

Green!!It's　OKAY





