## `component` と `props`

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
  const wrapper = factory({ msg: "Test 1" })
})

it("Test 2", ()=> {
  const wrapper = factory({ msg: "Test 2", hoge: true })
})
```

何度も作成するコンポーネントのwapperは可能な限りfactory関数で生成しましょう。とてもシンプルにテストがかけるようになります。

### 実際にコンポーネントを作成してみよう

さて今までの知識を使ってコンポーネントを作成していきましょう。

#### 1. コンポーネントを作成する

ColorButton.vue

```html
<template>
<div>
  <span v-if="isAdmin">管理者権限を実行する</span>
  <span v-else>権限がありません</span>
  <button>
    {{ msg }}
  </button>
</div>
</template>

<script>
export default {
  name: "ColorButton",

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

propsは2種類あり、`msg` で単純なメッセージを描画して `isAdmin` によってメッセージの出し分けをする簡単なコンポーネントになります。

#### 2. 権限がない状態のmsgを描画する

ColorButton.spec.js

```js
import { shallowMount } from '@vue/test-utils'
import ColorButton from '@/components/ColorButton.vue'

describe('Greeting.vue', () => {
  it('権限がない状態のメッセージを表示する', () => {
    const msg = "Button text"
    const wrapper = shallowMount(ColorButton,{
      propsData: {
        msg: msg
      }
    })

    console.log(wrapper.html())

    expect(wrapper.find("span").text()).toBe("権限がありません")
    expect(wrapper.find("button").text()).toBe("Button text")
  })
})
```

テスト結果

```shell
PASS  tests/unit/ColorButton.spec.js
  Greeting.vue
    ✓ 権限がない状態のメッセージを表示する (15ms)
```

console.logの出力結果

```html
<div>
  <span>権限がありません</span>
  <button>
    Button text
  </button>
</div>
```

`props` で渡された `msg` がきちんと描画されていることがわかります。

#### 3. 権限がある状態のmsgを描画する

`isAdmin` がtrueの状態でのレンダリングをテストしていきます。

ColorButton.spec.js

```js
import { shallowMount } from '@vue/test-utils'
import ColorButton from '@/components/ColorButton.vue'

describe('Greeting.vue', () => {
  it('権限がある状態のメッセージを表示する', () => {
    const msg = "Button text"
    const isAdmin = true
    const wrapper = shallowMount(ColorButton,{
      propsData: {
        msg,
        isAdmin
      }
    })

    expect(wrapper.find("span").text()).toBe("管理者権限を実行する")
    expect(wrapper.find("button").text()).toBe("Button text")
  })
})
```

テスト結果

```shell
PASS  tests/unit/ColorButton.spec.js
  Greeting.vue
    ✓ 権限がある状態のメッセージを表示する (4ms)
```

console.logの出力結果

```html
<div>
  <span>管理者権限を実行する</span>
  <button>
    Button text
  </button>
</div>
```

`props` で渡された `isAdmin` によって `<span>` の中がきちんと描画されていることがわかります。

#### 4. リファクタリング

先ほど紹介したfactory関数でリファクタリングしたいと思います。

```js
describe("リファクタリング", () => {
  const msg = "Button text"
  const factory = (propsData) => {
    return shallowMount(ColorButton, {
      propsData: {
        msg,
        ...propsData
      }
    })
  }
  const context = describe

  context("管理者あり", ()=> {
    it("メッセージを表示する", () => {
      const wrapper = factory()

      expect(wrapper.find("span").text()).toBe("権限がありません")
      expect(wrapper.find("button").text()).toBe("Button text")
    })
  })

  context("管理者なし", ()=> {
    it("メッセージを表示する", () => {
      const wrapper = factory({isAdmin: true})

      expect(wrapper.find("span").text()).toBe("管理者権限を実行する")
      expect(wrapper.find("button").text()).toBe("Button text")
    })
  })
})
```

さてテストを見ていきたいと思います。まだテストはGreenでPASSしています。

```shell
PASS  tests/unit/ColorButton.spec.js
  Greeting.vue
    リファクタリング
      管理者あり
        ✓ メッセージを表示する (5ms)
      管理者なし
        ✓ メッセージを表示する (2ms)
```

テストがあることで、変更やリファクタリングが怖くなくなりました。

### まとめ

- `propsData` はコンポーネントをマウントするときに引数として渡し、 `props` として利用できる
- factory関数を定義することでテストが簡単にかける
- `const context = describe` とすることでRspecみたいにかける
- `propsData` を使わずに [`setProps`](https://vue-test-utils.vuejs.org/ja/api/wrapper-array/#setprops-props) を使えばプロパティを強制的に更新することもできる



