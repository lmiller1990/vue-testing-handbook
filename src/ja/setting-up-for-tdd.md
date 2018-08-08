## vue-cli をインストールする

`vue-test-utils` は、VueJS 公式のテスト用ライブラリで、本ガイド全体で使用していくツールです。このツールは、ブラウザ環境でも Node.js 環境でも動作しますし、どんなテストランナーとも組み合わせることができます。本ガイドでは Node.js 環境でテストを走らせていきます。

`vue-test-utils` is the official testing library for Vue, and will be used throughout the guide. It runs in both a browser and Node.js environment, and works with any test runner. We will be running our tests in a Node.js environment throughout this guide.

`vue-cli` は `vue-test-utils` を用いたテストを始めるにあたって一番簡単な方法です。これを用いることで、プロジェクトを作成する際に、Jest の設定も行ってくれます。Jest はよく使われているテストフレームワークです。次のコマンドを実行してインストールしましょう。

`vue-cli` is the easiest way to get started. It will set up a project, as well as configure Jest, a popular testing framework. Install it by running:

```sh
yarn global add @vue/cli
```

npm をお使いの場合には次のコマンドを実行してください。

or with npm:

```sh
npm install -g @vue/cli
```

`vue create [project-name]` を実行して新しいプロジェクトを作成しましょう。その際に "Manually select features" を選択し、さらに  "Unit Testing" を選んで、さらにテストランナーには Jest を選択します。 

Create a new project by running `vue create [project-name]`. Choose "Manually select features" and "Unit Testing", and "Jest" for the test runner.

インストールが終わったら、`cd` でプロジェクトのディレクトリに移動し、`yarn test:unit` を実行します。今までの作業がうまくいっていれば、画面に次のようにメッセージが表示されます。

Once the installation finishes, `cd` into the project and run `yarn test:unit`. If everything went well, you should see:

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

Congradulations, you just ran your first passing test!

## 最初のテストを書く

さて、先ほどはプロジェクト作成時に用意されていたテストを実行しました。次に自分の手を動かしてコンポーネント書き、そのためのテストを書いていきましょう。伝統的に TDD においては、まず失敗するテストを書いて、それからテストをパスするコードを書きます。ですがまずはコンポーネントを最初に書いていくことにしましょう。

We ran an existing test that came with the project. Let's get our handy dirty, writing our own component, and a test. Traditionally when doing TDD, you write the failing test first, then implement the code which allows the test to pass. For now, we will write the component first.

プロジェクトを作成した時に作られた `src/components/HelloWorld.vue` や `tests/unit/HelloWorld.spec.js` は必要ありませんので、まずはこれを消してしまいましょう。

We don't need `src/components/HelloWorld.vue` or `tests/unit/HelloWorld.spec.js` anymore, so you can delete those.

## `Greeting` component を作成する。

`Greeting.vue` コンポーネントを作成していきます。このコンポーネント用のファイルは `src/components` に配置します。`Greeting.vue` には次のコードを書いてください。

Create a `Greeting.vue` file in `src/components`. Inside `Greeting.vue`, add the following:

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

`Greeting` has only one responsibility - to render the `greeting` value. The strategy will be:

1. コンポーネントを `mount` を用いて render する。
2. コンポーネントのテキスト部分に "Vue and TDD" が含まれていることを assert する。(訳注: assert とはテストにおいて、ある値がどのような値になればテストを通ったことになるか、その定義を宣言すること。)

1. render the component with `mount`
2. assert that the component's text contains "Vue and TDD"

では `Greeting.spec.js` を `tests/unit` ディレクトリの下に作成しましょう。そしてこのファイルの中で `Greeting.vue` を import して、それから `mount` をします。そうするとコードはだいたい次のようになります。

Create a `Greeting.spec.js` inside `tests/unit`. Inside, import `Greeting.vue`, as well as `mount`, and add the outline of the test:

```
import { mount } from '@vue/test-utils'
import Greeting from '@/components/Greeting.vue'

describe('Greeting.vue', () => {
  it('renders a greeting', () => {

  })
})
```

TDD に用いられるシンタックスは様々ですが、 Jest においては `describe` と `it` が比較的多く使われているようです。 `describe` はテストがどのようなものなのか、概要を示すために記述します。今回のケースでは `Greeting.vue` という部分ですね。`it` は、それによって題名を与えられたテストが、どのような目的を果たすためにあるのか、ということを示します。コンポーネントの機能が増えた際には、`it` ブロックを増やしていけばいいわけです。

There are differnet syntaxes used for TDD, we will use the commonly seen `describe` and `it` syntax that comes with Jest. `describe` generally outlines what the test is about, in this case `Greeting.vue`. `it` represents a single piece of responsility that the subject of the test should fulfil. As we add more features to the component, we add more `it` blocks.

さて、コンポーンネントを `mount` を用いて render せねばなりません。この一般的な慣習として、これによって生じたコンポーネントを `wrapper` という名前の変数に紐付けます。さらにその内容を画面に出力することにしましょう。これで正常に動作しているか確認できますね。

Now we should render the component with `mount`. The standard practice it to assign the component to a variable called `wrapper`. We will also print the output, to make sure everything is running correctly:

```js
const wrapper = mount(Greeting)

console.log(wrapper.html())
```

## テストを走らせる

`yarn test:unit`　とターミナルに打ち込んで実行することでテストを走らせましょう。`tests` ディレクトリ内にある `.spec.js` でファイル名が終わるものが、自動的に実行されます。全てがうまくいっていれば、以下のように画面に表示されます。

Run the test by typing `yarn test:unit` into your terminal. Any file in the `tests` directory ending with `.spec.js` is automatically executed. If everything went well, you should see:

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

We can see the markup is correct, and the test passes. The test is passing because there was no failure - this test can never fail, so it is very useful yet. Even if we change `Greeting.vue` and delete the `{{ message }}`, it will still pass. Let's change that.

## Assertion を作成する

コンポーネントが期待する挙動を正しくしているかどうかを判断するためには、assertion を作成する必要があります。そのためには Jest の `expect` API を使用します。こんなふうにです。`expect(result).to [matcher] (actual)`

We need to make an assertion to ensure the component is behaving correctly. We can do that using Jest's `epxect` API. It looks like this: `expect(result).to [matcher] (actual)`. 

_matcher_ の部分には、値やオブジェクトと比較するためのメソッドが使用されます。例えば次のようにです。 

_Matchers_ are methods to compare values and objects. For example:

```js
expect(1).toBe(1)
```

全ての matcher は [Jest documentation](https://jestjs.io/docs/ja/expect) で見ることができます。`vue-test-utils` ライブラリには一切 matcher は含まれていません。Jest が提供する matcher が十分なものであるからです。`Greeting` の中のテキストを比較したいので次のように書いてみましょう。

A full list of matchers available in the [Jest documentation](http://jestjs.io/docs/en/expect). `vue-test-utils` doesn't include any matchers - the ones Jest provides are more than enough. We want to compare the text from `Greeting`. We could write:

```js
expect(wrapper.html().includes("Vue and TDD")).toBe(true)
```

これでも機能しますが、`vue-test-utils` はマークアップを取得するための、よりよい方法を提供しています。`wrapper.text` です。ではこれを使ってテストを書く作業を終わりにしましょう。

but `vue-test-utils` has an even better way to get the markup - `wrapper.text`. Let's finish the test off:

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

We don't need the `console.log` anymore, so you can delete that. Run the tests with `yarn unit:test`, and if everything went well you should get:

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

Looking good. But you should always see a test fail, then pass, to make sure it's really working. In traditional TDD, you would write the test before the actual implementation, see if fail, the use the failing errors to guide your code. Let's make sure this test is really working. Update `Greeting.vue`:

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

And now run the test with `yarn test:unit`:

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

Jest gives us good feedback. We can see the expected and actual result, as well as on which line the expectation failed. The test did fail, as expected. Revert `Greeting.vue` and make sure the test is passing again.

次は `vue-test-utils` が提供する、コンポーネントをレンダーするためのメソッドである `mount` と `shallowMount` についてみていきましょう。

Next we will look at the two methods `vue-test-utils` provides to render components - `mount` and `shallowMount`. 
