[English](https://github.com/lmiller1990/vue-testing-handbook#vue-testing-handbook) | [日本語](https://github.com/lmiller1990/vue-testing-handbook#vue-testing-handbook-1)

## Vue Testing Handbook

Welcome to the Vue Testing Handbook!

## What is this?

This is a collection of short, focused examples on how to test Vue components. It uses `vue-test-utils`, the official library for testing Vue components, and Jest, a modern testing framework. It covers the `vue-test-utils` API, as well as best practises and useful parts of the Jest API for testing Vue components, as well an a demo project with all the example code.

Most sections have have a simple component or two, some tests, and the related code. Here is an example

[Setting up for TDD](https://github.com/lmiller1990/vue-testing-handbook/blob/master/docs/setting-up-for-tdd.md)
[Component](https://github.com/lmiller1990/vue-testing-handbook/blob/master/demo-app/src/components/Greeting.vue)
[Test](https://github.com/lmiller1990/vue-testing-handbook/blob/master/demo-app/tests/unit/Greeting.spec.js)

## Languages

We are aiming to support Japanese and English for now.

## Contributing 

### Development enviroment

Clone the repo and run `yarn`. Then run `yarn dev` to open the dev server.　Access it on `localhost:8080`.

There is an example project to run tests and examples. To run it, `cd demo-app`, then run `yarn`. To run the test run `yarn test:unit`.

### Existing pages

Make an issue regarding what you think can be improved, and why. Once everyone is happy with the addition, add it in English. Someone will translate it so the guide stays in sync for both languages, and it will be merged.

### Adding a new page

Make an issue explaining the benefit of the new page. Once everyone is in agreement, add the new page. You should also add an example to the `demo-app` project, so readers can easily recreate the scenario. You should also create a new page for the Japaense documentation, so someone can translate it later. This helps keep the guie up to date.

### Fixing grammar or stylist improvements

Just make the PR.

## Vue Testing Handbook

Vueテスティングハンドブックへようこそ！

## どういうガイドですか？

このガイドはVueコンポーネントをどうテストする簡単な例のコレクションです。コンポーネントをテストする更新ライブラルーの`vue-test-utils`とモダーンテストフレームワークのJestを使います。`vue-test-utils`のAPIとコンポーネントのテストのベストプラクティスを紹介します。よく使うJestのAPIも紹介します。

Most sections have have a simple component or two, some tests, and the related code. Here is an example

[TDDの開発環境の準備(英語)](https://github.com/lmiller1990/vue-testing-handbook/blob/master/docs/setting-up-for-tdd.md)
[コンポーネント](https://github.com/lmiller1990/vue-testing-handbook/blob/master/demo-app/src/components/Greeting.vue)
[テスト](https://github.com/lmiller1990/vue-testing-handbook/blob/master/demo-app/tests/unit/Greeting.spec.js)

## 言語

英語と日本語をサポートします。

## 貢献 

### 開発環境

レプをクローンして、`yarn`を実行します. そして`yarn dev`を実行して、`localhost:8080`にアクセスします。

デモプロジェクトもあります。`cd demo-app`して、そして`yarn`を実行してインストールします。`yarn test:unit`でテストを実行します。

### 既存のページに貢献

追加したいことについて課題を作ってください。ディスカッションしてから追加します。もし日本語だけで追加したら、誰かが翻訳してからマージします。

### 新しいページを追加

課題を作って、新しいページの価値を説明してください。皆さんは賛成すると、新しいページを追加してください。`demo-app`プロジェクトにも書いたコードの例を追加してください。そうすると、ガイドが説明した内容を簡単に再現できます。もし日本語だけで追加すると、英語のページを作って、誰かが翻訳します。

### 文法、スタイルだけの改善

普通にPRを作ってください。
