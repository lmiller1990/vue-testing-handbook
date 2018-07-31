[English](https://github.com/lmiller1990/vue-testing-handbook#vue-testing-handbook) | [日本語](https://github.com/lmiller1990/vue-testing-handbook#vue-testing-handbook-1)

## Vue Testing Handbook

Welcome to the Vue Testing Handbook!

## What is this?

This is a collection of short, focused examples on how to test Vue components. It uses `vue-test-utils`, the official library for testing Vue components, and Jest, a modern testing framework. It covers the `vue-test-utils` API, as well as best practises and useful parts of the Jest API for testing Vue components, as well an a demo project with all the example code.

## Style

Most sections have have a simple component or two, some tests, and the related code. Here is an example

- [Setting up for TDD](https://github.com/lmiller1990/vue-testing-handbook/blob/master/docs/setting-up-for-tdd.md). This is a guide about setting up an environment for TDD.
- [Component](https://github.com/lmiller1990/vue-testing-handbook/blob/master/demo-app/src/components/Greeting.vue). This is the component usd in the guide.
- [Test](https://github.com/lmiller1990/vue-testing-handbook/blob/master/demo-app/tests/unit/Greeting.spec.js). This is the test used in the guide.

Guides should be short, concise, and focused on a single concept. The relevant code should be linked in the article, and easily reproduced by the reader.

## Languages

We are aiming to support Japanese and English for now.

## Contributing 

### Development enviroment

Vuepress is used to generate the static website. Articles are written in markdown.

#### Guides

Clone the repo and run `yarn` to install the dependencies. Then run `yarn dev` to open the dev server.　Access it on `localhost:8080`.

#### Code Samples

There is an example project to run tests and examples used in the guides. To run it the demo app, run `cd demo-app` to navigate into the project, then run `yarn` to install the dependencies. Run `yarn test:unit` to execute the test suite.

### Updates existing guides

Make an issue regarding what you think can be improved, or just make a PR. 

### Adding a new page

Make an issue explaining the benefit of the new page. You should also add any relevant code and tests in the `demo-app` project, so readers can easily recreate the scenario.

## Vue Testing Handbook

Vueテスティングハンドブックへようこそ！

## どういうガイドですか？

このガイドはVueコンポーネントをどのようにテストし、どう使用するのかを簡単な例と共に紹介します。
コンポーネントをテストする更新ライブラリーの`vue-test-utils`とモダンテストフレームワークの`Jest`を使います。
`vue-test-utils`のAPIとコンポーネントのテストのベストプラクティスを紹介します。
よく使うJestのAPIも合わせて紹介します。

Most sections have have a simple component or two, some tests, and the related code. Here is an example

- [TDDの開発環境の準備(英語)](https://github.com/lmiller1990/vue-testing-handbook/blob/master/docs/setting-up-for-tdd.md)
- [コンポーネント](https://github.com/lmiller1990/vue-testing-handbook/blob/master/demo-app/src/components/Greeting.vue)
- [テスト](https://github.com/lmiller1990/vue-testing-handbook/blob/master/demo-app/tests/unit/Greeting.spec.js)

## 言語

英語と日本語をサポートします。

## 貢献 

### 開発環境

#### リポジトリをローカルにクローン
- コマンド
`git clone git@github.com:lmiller1990/vue-testing-handbook.git`

#### モジュールのインストール
- コマンド
`yarn install`

#### 実行
- コマンド
`yarn dev`

#### 表示
- ブラウザからアクセス
`localhost:8080`

#### 終了
- コマンド
`ctrl + c`

### デモ
ガイドに使うテストのデモプロジェクトもあります。

#### デモ環境
- コマンド
`cd demo-app`

#### モジュールのインストール
- コマンド
`yarn install`

#### 実行
- コマンド
`yarn test:unit`

### 既存のページに貢献

Issueを切って、それかPRを出します。レビューします。

### 新しいページを追加

課題を作って、新しいページの価値を説明してください。
`demo-app`プロジェクトにも書いたコードの例を追加してください。
そうすると、ガイドが説明した内容を簡単に再現できます。
