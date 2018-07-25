## propsDataの基本的な使い方

`propsData` は基本的に `mount` や `shallowMount` とともに使うことができ、 `propsData` は親コンポーネントから `props` として渡されたものとしてテストで使用できます。

第二引数のオブジェクトの中に書くことができますが、基本的な書き方は次の通りです。

```js
const wrapper = shallowMount(Foo, {
  propsData: {
    foo: 'bar'
  }
})
```

## コンポーネントの作成とテスト

## SubmitButton.vue

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
  name: "SubmitButton",

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

## 最初のテスト

権限がない状態でのメッセージを検証していく。

```js
import { shallowMount } from '@vue/test-utils'
import SubmitButton from '@/components/SubmitButton.vue'

describe('SubmitButton.vue', () => {
  it('権限がない状態のメッセージを表示する', () => {
    const msg = "送信する"
    const wrapper = shallowMount(SubmitButton,{
      propsData: {
        msg: msg
      }
    })

    console.log(wrapper.html())

    expect(wrapper.find("span").text()).toBe("権限がありません")
    expect(wrapper.find("button").text()).toBe("送信する")
  })
})
```

`yarn test:unit`でテストを実行します。テスト結果：

```
PASS  tests/unit/SubmitButton.spec.js
  SubmitButton.vue
    ✓ 権限がない状態のメッセージを表示する (15ms)
```

`console.log(wrapper.html())`の出力結果も表示されました：

```html
<div>
  <span>権限がありません</span>
  <button>
    送信する
  </button>
</div>
```

`props` で渡された `msg` がきちんと描画されていることがわかります。

## 2つ目のテスト

権限がある状態 ( `isAdmin` が true ) でのメッセージを検証していく。

```js
import { shallowMount } from '@vue/test-utils'
import SubmitButton from '@/components/SubmitButton.vue'

describe('SubmitButton.vue', () => {
  it('権限がある状態のメッセージを表示する', () => {
    const msg = "送信する"
    const isAdmin = true
    const wrapper = shallowMount(SubmitButton,{
      propsData: {
        msg,
        isAdmin
      }
    })

    expect(wrapper.find("span").text()).toBe("管理者権限を実行する")
    expect(wrapper.find("button").text()).toBe("送信する")
  })
})
```

`yarn test:unit`を実行して、テスト結果を確認します。

```shell
pass  tests/unit/submitbutton.spec.js
  submitbutton.vue
    ✓ 権限がある状態のメッセージを表示する (4ms)
```

console.logの出力結果

```html
<div>
  <span>管理者権限を実行する</span>
  <button>
    送信する
  </button>
</div>
```

`props` で渡された `isAdmin` によって `<span>` の中がきちんと描画されていることがわかります。

## テストのリファクタリング

`Don't repeat yourself` の原則に従って従ってテストをリファクタリングしていきましょう。テストがPassしているのでリファクタリングも怖くありません。

## factory関数

テストの度に `shallowMount` を呼び出し同じような `propsData` を渡しているので、factory関数でリファクタリングしたいと思います。

```js
const msg = "送信する"
const factory = (propsData) => {
  return shallowMount(SubmitButton, {
    propsData: {
      msg,
      ...propsData
    }
  })
}
```

呼び出すたびに `shallowMount` で wrap してくれる factory 関数ができました。更新したい`props`を`factory`に渡せます。これを使ってテストをDRYにしていきましょう。

```js
describe("管理者あり", ()=> {
  it("メッセージを表示する", () => {
    const wrapper = factory()

    expect(wrapper.find("span").text()).toBe("権限がありません")
    expect(wrapper.find("button").text()).toBe("送信する")
  })
})

describe("管理者なし", ()=> {
  it("メッセージを表示する", () => {
    const wrapper = factory({ isAdmin: true })

    expect(wrapper.find("span").text()).toBe("管理者権限を実行する")
    expect(wrapper.find("button").text()).toBe("送信する")
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

## まとめ

- `propsData` はコンポーネントをマウントするときに引数として渡し、`props`として利用できる
- factory関数を定義することでテストがDRYにかける
- `propsData` を使わずに [`setProps`](https://vue-test-utils.vuejs.org/ja/api/wrapper-array/#setprops-props) を使えばプロパティを強制的に更新することもできる
