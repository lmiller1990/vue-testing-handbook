## 算出プロパティ

算出プロパティは単純なJavaScriptのオブジェクトなのでテストを書くのが簡単です。

算出プロパティのテストを書く２つの方法を紹介します。`numbers`の算出プロパティによって偶数か奇数のリストをレンダーする`<NumberRenderer>`コンポーネントを作ります。

## テストを書く

`<NumberRenderer>`は`Boolean`の`even`プロップを受け取ります。`even`は`true`の場合、2, 4, 6, 8を表示します。`false`の場合、1, 3, 5, 7, 9を表示します。`numbers`のプロパティで算出します。

## 値をレンダーしてテストを書く

テストを書いてみましょう。

```js
import { shallowMount } from "@vue/test-utils"
import NumberRenderer from "@/components/NumberRenderer.vue"

describe("NumberRenderer", () => {
  it("偶数をレンダー", () => {
    const wrapper = shallowMount(NumberRenderer, {
      propsData: {
        even: true
      }
    })

    expect(wrapper.text()).toBe("2, 4, 6, 8")
  })
})
```

実行する前に`<NumberRenderer>`を書いてみます。

```
<template>
  <div>
  </div>
</template>

<script>
export default {
  name: "NumberRenderer",

  props: {
    even: {
      type: Boolean,
      required: true
    }
  }
}
</script>
```

開発しましょう。`yarn test:unit`を実行して、エラーメッセージによって進みます。

```
● NumberRenderer › 偶数をレンダー

  expect(received).toBe(expected) // Object.is equality

  Expected: "2, 4, 6, 8"
  Received: ""
```

`numbers`の算出プロパティを書いてみます。

```js
computed: {
  numbers() {
    const evens = []

    for (let i = 1; i < 10; i++) {
      if (i % 2 === 0) {
        evens.push(i)
      }
    }

    return evens
  }
}
```

テンプレートを更新して新しく書いたプロパティを使います：

```html
<template>
  <div>
    {{ numbers }}
  </div>
</template>
```

`yarn test:unit`を実行すると：

```
FAIL  tests/unit/NumberRenderer.spec.js
● NumberRenderer › 偶数をレンダー

  expect(received).toBe(expected) // Object.is equality

  Expected: "2, 4, 6, 8"
  Received: "[
    2,
    4,
    6,
    8
  ]"
```

 数は正しいですが、リストをいい感じにフォーマットしたいです。返す値を更新します：

```js
return evens.join(", ")
```

`yarn test:unit`を実行したらパスです。

## `call`でテストを書く

`even: false`の場合のテストを追加しましょう。今回はコンポーネントをレンダーせずに算出プロパティをテストする方法を紹介します。

先にテストを書きます：

```js
it("奇数をレンダー", () => {
  const localThis = { even: false }

  expect(NumberRenderer.computed.numbers.call(localThis)).toBe("1, 3, 5, 7, 9")
})
```

コンポーネントを`shallowMount`でレンダーして`wrapper.text()`の検証をする代わりに、`call`で別の`this`を渡します。テストをパスしてから、`call`を使わないとどうなるかをみます。

上に書いてあるテストを実行する：

```
FAIL  tests/unit/NumberRenderer.spec.js
● NumberRenderer › 奇数をレンダー

  expect(received).toBe(expected) // Object.is equality

  Expected: "1, 3, 5, 7, 9"
  Received: "2, 4, 6, 8"
```

`numbers`を更新します：

```js
numbers() {
  const evens = []
  const odds = []

  for (let i = 1; i < 10; i++) {
    if (i % 2 === 0) {
      evens.push(i)
    } else {
      odds.push(i)
    }
  }

  return this.even === true ? evens.join(", ") : odds.join(", ")
}
```

偶数と奇数の場合はパスです。`call`を使わないとどうなりますか？使わないように更新します：

```js
it("奇数をレンダー", () => {
  const localThis = { even: false }

  expect(NumberRenderer.computed.numbers()).toBe("1, 3, 5, 7, 9")
})
```

このままでテストを実行すると失敗します。

```
FAIL  tests/unit/NumberRenderer.spec.js
● NumberRenderer › 奇数をレンダー

  expect(received).toBe(expected) // Object.is equality

  Expected: "1, 3, 5, 7, 9"
  Received: "2, 4, 6, 8"
```

`vue`は`props`を`this`にバンドしてくれます。`shallowMount`などでレンダーしないので、`this`に何もバインドしません。`numbers`の中で`console.log(this)`をすると`this`が見えます。`this`は`numbers`プロパティがある`computed`オブジェクトとなります。

```
{ numbers: [Function: numbers] }
```

それで`call`を使うと別の`this`値を渡せます。上のテストで`even`プロパティがある`this`オブジェクトを渡しました。

## `call`か`shallowMount`?

算出プロパティのテストを書くには`call`と`shallowMount`が両方とも便利なテクニックです。`call`が特に便利な場合は：

- `mounted` などの [インスタンスライフサイクルフック](https://jp.vuejs.org/v2/guide/instance.html#%E3%82%A4%E3%83%B3%E3%82%B9%E3%82%BF%E3%83%B3%E3%82%B9%E3%83%A9%E3%82%A4%E3%83%95%E3%82%B5%E3%82%A4%E3%82%AF%E3%83%AB%E3%83%95%E3%83%83%E3%82%AF) の実行に時間がかかる場合、またライフサイクルフックを呼び出したくない場合です。コンポーネントをレンダーしないので、ライフサイクルフックも実行しません。
- `this`を細かく設定したい場合

もちろんコンポーネントが正しくレンダーするテストも必要です。テストしたいことに合わせてもっとも適切なテクニックを選んで、エッジケースをちゃんとテストします。
