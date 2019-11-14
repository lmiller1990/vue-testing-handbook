## Vue.jsテストハンドブック

Vue.jsテストハンドブックにようこそ！

このハンドブックはVueコンポーネントをどうテストするか簡単な例の集めたものです。コンポーネントをテストする公式ライブラリーの`vue-test-utils`とモダーンテストフレームワークのJestを使います。`vue-test-utils`のAPIとコンポーネントのテストの最適な実践を紹介します。

各セクションはその他のセクションとは独立してます。最初は`vue-cli`をインストールしてテスト環境を準備してから最初のテストを書きます。そしてコンポーネントをレンダーする`mount`と`shallowMount`の２つの方法とそれぞれの違いを説明します。

続いてコンポーネントをテストするときによくある場面を紹介します。例えば：

- `props`を受け取る
- 算出プロパティ
- 別のコンポーネントをレンダーする
- イベントを`emit`する


そのあと、次でもっと興味深いケースを見てみます。例えば：

- Vuexをテストするベストプラクティス（コンポーネントと、コンポーネント以外）
- Vueルーターのテスト
- 第三者のコンポーネントのテスト

JestのAPIでテストをもっと安定させる方法も紹介します。例えば：

- APIレスポンスをモックする
- モジュールのモックとスパイ
- スナップショット

## 他の参考

- [公式のドキュメント](https://vue-test-utils.vuejs.org/)
- [`vue-test-utils`を作った人が書いた本](https://www.manning.com/books/testing-vue-js-applications) （英語）
- [VueSchoolの`vue-test-utils`のコース](https://vueschool.io/courses/learn-how-to-test-vuejs-components?friend=vth) （英語）
