## vue-cli をインストールする

`vue-test-utils` は、VueJS 公式のテスト用ライブラリで、本ガイド全体で使用していくツールです。このツールは、ブラウザ環境でも Node.js 環境でも動作しますし、どんなテストランナーとも組み合わせることができます。本ガイドでは Node.js 環境でテストを走らせていきます。

`vue-cli` は `vue-test-utils` を用いたテストを始めるにあたって一番簡単な方法です。これを用いることで、プロジェクトを作成する際に、Jest の設定も行ってくれます。Jest はよく使われているテストフレームワークです。次のコマンドを実行してインストールしましょう。

```sh
yarn global add @vue/cli
```

npm をお使いの場合には次のコマンドを実行してください。

or with npm:

```sh
npm install -g @vue/cli
```

`vue create [project-name]` を実行して新しいプロジェクトを作成しましょう。その際に "Manually select features" を選択し、さらに  "Unit Testing" を選んで、さらにテストランナーには Jest を選択します。 

インストールが終わったら、`cd` でプロジェクトのディレクトリに移動し、`yarn test:unit` を実行します。今までの作業がうまくいっていれば、画面に次のようにメッセージが表示されます。

```
 PASS  tests/unit/HelloWorld.spec.js
  HelloWorld.vue
    ✓ renders props.msg when passed (26ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        2.074s
```

おめでとうございます。最初のテストを走らせて、無事テストをパスしました。

## 最初のテストを書く

さて、先ほどはプロジェクト作成時に用意されていたテストを実行しました。次に自分の手を動かしてコンポーネント書き、そのためのテストを書いていきましょう。伝統的に TDD においては、まず失敗するテストを書いて、それからテストをパスするコードを書きます。ですがまずはコンポーネントを最初に書いていくことにしましょう。

プロジェクトを作成した時に作られた `src/components/HelloWorld.vue` や `tests/unit/HelloWorld.spec.js` は必要ありませんので、まずはこれを消してしまいましょう。

## `Greeting` component を作成する。

`Greeting.vue` コンポーネントを作成していきます。このコンポーネント用のファイルは `src/components` に配置します。`Greeting.vue` には次のコードを書いてください。

```vue
<template>
  <div>
    {{ greeting }}
  </div>
</template>

<script>
export default {
  name: "Greeting",

  data() {
    return {
      greeting: "Vue and TDD"
    }
  }
}
</script>
```

## テストを書く

`Greeting` コンポーネントの役割はたった一つ。`greeting` の値を render することだけです。ですからこのためのテストを書くには、次の方針でいきましょう。

1. コンポーネントを `mount` を用いて render する。
2. コンポーネントのテキスト部分に "Vue and TDD" が含まれていることを assert する。(訳注: assert とはテストにおいて、ある値がどのような値になればテストを通ったことになるか、その定義を宣言すること。)

では `Greeting.spec.js` を `tests/unit` ディレクトリの下に作成しましょう。そしてこのファイルの中で `Greeting.vue` を import して、それから `mount` をします。そうするとコードはだいたい次のようになります。

```js
import { mount } from '@vue/test-utils'
import Greeting from '@/components/Greeting.vue'

describe('Greeting.vue', () => {
  it('renders a greeting', () => {

  })
})
```

TDD に用いられるシンタックスは様々ですが、 Jest においては `describe` と `it` が比較的多く使われているようです。 `describe` はテストがどのようなものなのか、概要を示すために記述します。今回のケースでは `Greeting.vue` という部分ですね。`it` は、それによって題名を与えられたテストが、どのような目的を果たすためにあるのか、ということを示します。コンポーネントの機能が増えた際には、`it` ブロックを増やしていけばいいわけです。

さて、コンポーンネントを `mount` を用いて render せねばなりません。この一般的な慣習として、これによって生じたコンポーネントを `wrapper` という名前の変数に紐付けます。さらにその内容を画面に出力することにしましょう。これで正常に動作しているか確認できますね。

```js
const wrapper = mount(Greeting)

console.log(wrapper.html())
```

## テストを走らせる

`yarn test:unit`　とターミナルに打ち込んで実行することでテストを走らせましょう。`tests` ディレクトリ内にある `.spec.js` でファイル名が終わるものが、自動的に実行されます。全てがうまくいっていれば、以下のように画面に表示されます。

```
PASS  tests/unit/Greeting.spec.js
Greeting.vue
  ✓ renders a greeting (27ms)

console.log tests/unit/Greeting.spec.js:7
  <div>
    Vue and TDD
  </div>
```

先ほど書いたマークアップが正しく、テストが通ったということですね。ただし、このテストはいつでも通ります。なぜなら assertion をしていないので絶対に失敗しないからです。(それでももちろん有用ではあるのですが。) たとえ `Greeting.vue` を書き換えて `{{ message }}` を削除してしまっても、このテストはパスしてしまいます。ではこれに変更を加えていきましょう。

## Assertion を作成する

コンポーネントが期待する挙動を正しくしているかどうかを判断するためには、assertion を作成する必要があります。そのためには Jest の `expect` API を使用します。こんなふうにです。`expect(result).to [matcher] (actual)`

_matcher_ の部分には、値やオブジェクトと比較するためのメソッドが使用されます。例えば次のようにです。 

```js
expect(1).toBe(1)
```

全ての matcher は [Jest documentation](https://jestjs.io/docs/ja/expect) で見ることができます。`vue-test-utils` ライブラリには一切 matcher は含まれていません。Jest が提供する matcher が十分なものであるからです。`Greeting` の中のテキストを比較したいので次のように書いてみましょう。

```js
expect(wrapper.html().includes("Vue and TDD")).toBe(true)
```

これでも機能しますが、`vue-test-utils` はマークアップを取得するための、よりよい方法を提供しています。`wrapper.text` です。ではこれを使ってテストを書く作業を終わりにしましょう。

```js
import { mount } from '@vue/test-utils'
import Greeting from '@/components/Greeting.vue'

describe('Greeting.vue', () => {
  it('renders a greeting', () => {
    const wrapper = mount(Greeting)

    expect(wrapper.text()).toMatch("Vue and TDD")
  })
})
```

`console.log`　はもう必要ないので削除してしまってもかまいません。`yarn unit:test` を実行してテストを走らせましょう。全てがうまくいっていれば、次のようになるはずです。

```
PASS  tests/unit/Greeting.spec.js
Greeting.vue
  ✓ renders a greeting (15ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        1.477s, estimated 2s
```

よさそうですね。ですが、TDD の伝統に則るのであれば、まずテストが失敗するところから初めて、次にそれが通るようにするという手順を踏んで、本当に機能していることを確認したほうがいいでしょう。テストをまず書いてから、そのあとに実装をします。そしてテストが失敗したら、そのエラー文を参考にコードを修正していきます。ではそうなるようにやってみましょう。すでに書いた `Greeting.vue` コンポーネントを次のように変更します。

```vue
<template>
  <div>
    {{ greeting }}
  </div>
</template>

<script>
export default {
  name: "Greeting",

  data() {
    return {
      greeting: "Vue without TDD"
    }
  }
}
</script>
```

そして `yarn test:unit` で実行します。

```
FAIL  tests/unit/Greeting.spec.js
Greeting.vue
  ✕ renders a greeting (24ms)

● Greeting.vue › renders a greeting

  expect(received).toMatch(expected)

  Expected value to match:
    "Vue and TDD"
  Received:
    "Vue without TDD"

     6 |     const wrapper = mount(Greeting)
     7 |
  >  8 |     expect(wrapper.text()).toMatch("Vue and TDD")
       |                            ^
     9 |   })
    10 | })
    11 |

    at Object.<anonymous> (tests/unit/Greeting.spec.js:8:28)
```

エラーに関するフィードバックを得ることができました。期待する値と、テスト実行時の実際の値がわかりますね。そしてどの行でエラーが出ているかも示されています。テストは失敗しました。これは私たちが予想していた通りです。`Greeting.vue` を元に戻して、テストがもう一度通るようにしましょう。

次は `vue-test-utils` が提供する、コンポーネントをレンダーするためのメソッドである `mount` と `shallowMount` についてみていきましょう。
