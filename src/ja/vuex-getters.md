## ゲッターをテストする
ゲッターのテストだけを独立しておこなう場合には、複雑な手順は全く必要ありません。ゲッターは通常のJavasScriptの関数だからです。テストの方法はミューテーションやアクションに対するテストと似ています。ミューテーションに関する詳細な情報は[こちら](https://lmiller1990.github.io/vue-testing-handbook/ja/vuex-mutations.html)をご覧ください。

このガイドのテストのソースコードは[こちら](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/getters.spec.js)です。

下記のようなストアで動作する2つのゲッターを見ていきましょう。

```js
const state = {
  dogs: [
    { name: "lucky", breed: "poodle", age: 1 },
    { name: "pochy", breed: "dalmatian", age: 2 },
    { name: "blackie", breed: "poodle", age: 4 }
  ]
}
```

ゲッターに対するテストは下記の通りです。
1. `poodles`: 全ての`poodles`が取得できること
2. `poodlesByAge`: 全ての`poodles`が取得でき、引数として`age`を受け取れること

## ゲッターの作成

まずは、ゲッターを作成します。

```js
export default {
  poodles: (state) => {
    return state.dogs.filter(dog => dog.breed === "poodle")
  },

  poodlesByAge: (state, getters) => (age) => {
    return getters.poodles.filter(dog => dog.age === age)
  }
}
```

変わったことはありません - ゲッターは第2引数として他のゲッターを受け取ることを思い出してください。すでに`poodles` ゲッターが存在するので、`poodlesByAge`の中でそれを使用することができます。`poodlesByAge`の中で引数をとる関数を返すことで、ゲッターに引数を渡すことができます。`poodlesByAge`ゲッターを下記のように使用することができます。

```js
computed: {
  puppies() {
    return this.$store.getters.poodlesByAge(1)
  }
}
```

`poodles`に対するテストを書いていきましょう。

## テストを書く

ゲッターは第一引数に`state`objectを取る通常のJavaScriptの関数なので、テストはとてもシンプルになります。`getters.spec.js`のテストを下記のように書いていきます。

```js
import getters from "../../src/store/getters.js"

const dogs = [
  { name: "lucky", breed: "poodle", age: 1 },
  { name: "pochy", breed: "dalmatian", age: 2 },
  { name: "blackie", breed: "poodle", age: 4 }
]
const state = { dogs }

describe("poodles", () => {
  it("returns poodles", () => {
    const actual = getters.poodles(state)

    expect(actual).toEqual([ dogs[0], dogs[2] ])
  })
})
```

Vuexは自動的に`state`をゲッターへ渡します。独立したゲッターのテストを行なっているので、`state`を手動で渡さなければなりません。それ以外にも、通常のJavaScriptの関数をテストしています。

`poodlesByAge`はもう少し興味深いです。ゲッターの第二引数は他のゲッターです。`poodlesByAge`のテストをしているので、`poodles`の実装をテストに含めたくないです。そのため、`poodles`ゲッターをスタブします。これにより、テストをより細かくコントロールすることができます。

```js
describe("poodlesByAge", () => {
  it("returns poodles by age", () => {
    const poodles = [ dogs[0], dogs[2] ]
    const actual = getters.poodlesByAge(state, { poodles })(1)

    expect(actual).toEqual([ dogs[0] ])
  })
})
```

`poodles`ゲッターを引数として渡す代わりに、`poodles`が返す結果を渡します。テストを書いているので、すでに動作することがわかっています。これにより、`poodlesByAge`固有のロジックのテストに集中することができます。

非同期のゲッターを持つことが可能です。非同期のアクションと同じテスト手法でテストができます。それについては[こちら](https://lmiller1990.github.io/vue-testing-handbook/ja/vuex-actions.html)をご覧ください。

## 結論

- `getters` は通常のJavaScriptの関数である
- `getters`のテストを独立して行う場合、stateを手動で渡す必要がある
- ゲッターを他のゲッターで使用する場合、そのゲッターの期待する返り値をスタブするべき。これにより、テストをよりコントロールすることができ、テスト対象のゲッターのテストに集中することができる

この記事のテストの完成形は[こちら](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/getters.spec.js)です。
