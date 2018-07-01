## Vue.jsテスティングハンドブック

テスティングハンドブックへようこそ！

This is a collection of short, focused examples on how to test Vue components. It uses `vue-test-utils`, the official library for testing Vue components, and Jest, a modern testing framework. It covers the `vue-test-utils` API, as well as best practises for testing components.

このハンドブックはVueコンポーネントをどうテストする簡単な例のコレクションです。コンポーネントをテストする更新ライブラルーの`vue-test-utils`とモダーンテストフレームワークのJestを使います。`vue-test-utils`のAPIとコンポーネントのテストのベストプラクティスを紹介します。

Each section is independent from the others. It starts off covering the two ways to render a component in a test, `mount` and `shallowMount`, and illustrates the difference. We then move forward into setting up an environment with `vue-cli` and writing a simple test.

例はお互いと別です。最初はコンポーネントをレンダーする`mount`と`shallowMount`の２つの方法とそれぞれの違いを説明します。そして`vue-cli`をインストールしてテスト環境を準備してから最初のテストを書きます。

From then on, we cover how to test various scenarios that arise when testing components, such as testing components that:

- receive props
- use computed properties
- render other components
- emit events

続いてコンポーネントをテストするときのよくある場合を紹介します。例えば：

- `props`を受け取る
- 算出プロパティ
- 別のコンポーネントをレンダーする
- イベントを`emit`する

and so forth. We then move on to more interesting cases, such as:

そのあと、もっと興味を引くケースを見てみます。例えば：

- Vuexをテストするベストプラクティス（コンポーネントと、コンポーネント以外）
- Vueルーターのテスト
- 第三者のコンポーネントのテスト

- best practises for testing Vuex (in components, and independently)
- testing Vue router
- testing involving third party components

We wil also explore how to use the Jest API to make our tests more robust, such as:

JestのAPIでテストをもっと柔軟にする方法も紹介します。例えば：

- APIレスポンスをモックする
- モジュールのモックとスパイ
- スナップショット

- mocking API responses
- mocking and spying on modules
- using snapshots

## Languages

For now, the guide is in English and Japanese.

## 言語

英語と日本語をサポートします。
