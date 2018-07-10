## propsData の基本的な使い方

`propsData` は基本的に `mount` や `shallowMount` とともに使うことができ、 `propsData` は親コンポーネントから `props` として渡されたものとしてテストで使用できます。

第二引数のオブジェクトの中に書くことができますが、基本的な書き方は次の通りです：

```js
const wrapper = shallowMount(Foo, {
  propsData: {
    foo: 'bar'
  }
})
```

## コンポーネントの作成とテスト

### ColorButton.vue

2つの `props` を持つ簡単なコンポーネントを作成する。

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

### 最初のテスト

権限がない状態でのメッセージを検証していく。

```js
import { shallowMount } from '@vue/test-utils'
import ColorButton from '@/components/ColorButton.vue'

describe('SubmitButton.vue', () => {
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

```
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

### 2つ目のテスト

権限がある状態 ( `isAdmin` が true ) でのメッセージを検証していく。

ColorButton.spec.js

```js
import { shallowMount } from '@vue/test-utils'
import ColorButton from '@/components/ColorButton.vue'

describe('SubmitButton.vue', () => {
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

## テストのリファクタリング

Don't repeat yourselfの原則に従って従ってテストをリファクタリングしていきましょう。テストがPassしているのでリファクタリングも怖くありません。

### factory関数

テストの度に `shallowMount` を呼び出し同じような `propsData` を渡しているので、factory関数でリファクタリングしたいと思います。

```js
const msg = "Button text"
const factory = (propsData) => {
  return shallowMount(ColorButton, {
    propsData: {
      msg,
      ...propsData
    }
  })
}
```

呼び出すたびに `shallowMount` で wrap してくれる factory 関数ができました。これを使ってテストをDRYにしていきましょう。

```js
  describe("管理者あり", ()=> {
    it("メッセージを表示する", () => {
      const wrapper = factory()

      expect(wrapper.find("span").text()).toBe("権限がありません")
      expect(wrapper.find("button").text()).toBe("Button text")
    })
  })

  describe("管理者なし", ()=> {
    it("メッセージを表示する", () => {
      const wrapper = factory({isAdmin: true})

      expect(wrapper.find("span").text()).toBe("管理者権限を実行する")
      expect(wrapper.find("button").text()).toBe("Button text")
    })
  })
```

さてテストを見ていきたいと思います。まだテストはGreenでPASSしています。

```shell
PASS  tests/unit/SubmitButton.spec.js
  SubmitButton.vue
    リファクタリング
      管理者あり
        ✓ メッセージを表示する (5ms)
      管理者なし
        ✓ メッセージを表示する (2ms)
```

テストがあることで、変更やリファクタリングが怖くなくなりました。

### まとめ

- `propsData` はコンポーネントをマウントするときに引数として渡し、 `props` として利用できる
- factory関数を定義することでテストがDRYにかける
- `propsData` を使わずに [`setProps`](https://vue-test-utils.vuejs.org/ja/api/wrapper-array/#setprops-props) を使えばプロパティを強制的に更新することもできる
