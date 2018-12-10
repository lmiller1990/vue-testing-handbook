Actions の単体テストは特に面倒なことなく実行できます。これは mutations の単体テストがシンプルに可能であることとよく似ています。mutation のテストについては以前の記事を参照してください。Component から actions を発行する test に関してはこの記事を参照してください。[こちら](https://lmiller1990.github.io/vue-testing-handbook/vuex-in-components-mutations-and-actions.html)

このページで扱っている test は、このリポジトリにあります。[リポジトリ](https://github.com/lmiller1990/vue-testing-handbook/blob/master/demo-app/tests/unit/actions.spec.js)

## アクションを作成する

作成する action は一般的な Vuex パターンに従ったものです。

- API に対して非同期にコールをし、
- レスポンスデータに対してなんらかの加工をし、(必須ではありませんが)
- その結果を payload にのせて mutation に対して commit する。

つまりこれは認証をおこなう action で、username と password を外部の API に送って、それが正しいものかどうかを判断します。その結果を使って `SET_AUTHENTICATED` mutation にコミットし、state を変更します。

```js:title=action
import axios from "axios"

export default {
  async authenticate({ commit }, { username, password }) {
    const authenticated = await axios.post("/api/authenticate", {
      username, password
    })

    commit("SET_AUTHENTICATED", authenticated)
  }
}
```

この action のテストでは以下の項目を検査する必要があります。

- API のエンドポイントは正しいか
- payload は正しいか
- `commit` の結果引き起こされた `mutaiton` は正しいものだったか

ではまずはテストを書いてから、その失敗メッセージに従って進めていきましょう。

## テストを書く

```js:title=action のテスト
describe("authenticate", () => {
  it("authenticated a user", async () => {
    const commit = jest.fn()
    const username = "alice"
    const password = "password"

    await actions.authenticate({ commit }, { username, password })

    expect(url).toBe("/api/authenticate")
    expect(body).toEqual({ username, password })
    expect(commit).toHaveBeenCalledWith(
      "SET_AUTHENTICATED", true)
  })
})
```

`axios` は非同期に処理を行うので、Jest はその処理が終わることを待つ必要があります。そのためには async を宣言し、await で `actions.authenticate` の呼び出しを待ちます。そうしないとテストは `expect` の宣言の前に終わってしまうので、このテストは決して色褪せることのない新緑のようなテストということになってしまいます。つまり、決して失敗しないテストになってしまいます。

上記テストを実行すると以下のようなテスト失敗のメッセージが表示されます。

```
 FAIL  tests/unit/actions.spec.js
  ● authenticate › authenticated a user

    SyntaxError: The string did not match the expected pattern.

      at XMLHttpRequest.open (node_modules/jsdom/lib/jsdom/living/xmlhttprequest.js:482:15)
      at dispatchXhrRequest (node_modules/axios/lib/adapters/xhr.js:45:13)
      at xhrAdapter (node_modules/axios/lib/adapters/xhr.js:12:10)
      at dispatchRequest (node_modules/axios/lib/core/dispatchRequest.js:59:10)
```

このエラーは axios の中で起きているエラーです。`/api/authenticate` に対して axios でリクエストをしていますが、test 環境でこれを実行しているために、このリクエストを受けるエンドポイントがないためにエラーが起きています。加えて `url` と `body` も定義されていませんが、これは axios の問題を処理した後で対応することとします。

このシリーズ記事では、Jest をテストツールに使用しているので、Jest の mock 機能である jest.mock を使うことで容易にに API の呼び出しをモック化することができます。本当の Axios ではなく、それをモック化したものを使うことで、よりその挙動をコントロールすることができるのです。Jest の提供する ES6 Class Mock が、Axios をモック化するのに最適な機能です。

Axios のモックは次のようなコードになります。

```js:title=Jest の内部で axios を mock 化する
let url = ''
let body = {}

jest.mock("axios", () => ({
  post: (_url, _body) => { 
    return new Promise((resolve) => {
      url = _url
      body = _body
      resolve(true)
    })
  }
}))
```

この axios の mock は、url と body を変数に記録します。その目的は、「エンドポイント」と受け取った「payload」が正しいことをテストで宣言するためです。

(訳注: この axios を mock した関数は、実際に axios が実行される場合に代わりに実行される。そしてここで定義した mock は、`.post` というメソッドを持ち、このメソッドは `_url` と `_body` を受け取る。つまりこの mock は、元の axios が `axios.post(someUrl, { someBody })` という形で実行される際に、割り込んで `post: (_url, _body) => {}` を実行するのだ。結果として、グローバル変数に置かれた `url` と　`body` に値が代入される。この値を assertion で使用するというわけだ。)

本当のエンドポイントを実行したいわけではないので、このモックは Primise を即時解決させて、API が成功した状態を擬似的に再現しています。

`yarn unit:pass` を実行してみると、やっとテストが通りますね！

## API のエラー時のテストを書く 

API の呼び出しが「成功」した場合のみをテストしてきました。しかし、考えうる結果すべてをテストすることが非常に重要です。ですから、Error が発生した場合のテストを書いていくことにしましょう。今回もまずはテストを書いて、それに従って API を実装していくことしましょう。

テストは次のように書くことができるでしょう。

```js:title=Jest による test
it("catches an error", async () => {
  mockError = true

  await expect(actions.authenticate({ commit: jest.fn() }, {}))
    .rejects.toThrow("エラーが起きました.")
})
```

axios mock に強制的に `thow an error` させる必要があります。そのために `mockError` 変数を用意します。次のように書き換えましょう。

```js:title=Jest による test
let url = ''
let body = {}
let mockError = false

jest.mock("axios", () => ({
  post: (_url, _body) => { 
    return new Promise((resolve) => {
      if (mockError) 
        throw Error()

      url = _url
      body = _body
      resolve(true)
    })
  }
}))
```

Jest の ES6 class mock は、名前が `mock` から始まる変数に限っては、scope の外側の変数でも参照することができます。ですので、mockError という変数を単純に `true` にセットすることで axios mock にエラーを起こしてもらうことにしましょう。

すると次のようなエラーがでるはずです。

```
FAIL  tests/unit/actions.spec.js
● authenticate › catchs an error

  expect(function).toThrow(string)

  Expected the function to throw an error matching:
    "エラーが起きました"
  Instead, it threw:
    Mock error
```

エラーはうまく起こせましたが、期待した挙動にはなっていませんね。authenticate メソッドを修正し、期待した error が throw されるように修正しましょう。

```js:title=action を修正する
export default {
  async authenticate({ commit }, { username, password }) {
    try {
      const authenticated = await axios.post("/api/authenticate", {
        username, password
      })

      commit("SET_AUTHENTICATED", authenticated)
    } catch (e) {
      throw Error("エラーが起きました。")
    }
  }
}
```

これでテストが通るようになりましたね。

## 改良
 
Action を単体テストすることができました。ただし、このテストは少なくとも一箇所、大幅に改善できる余地が残されています。それは axios の mock を manual mock として実装することです。`__mocks__` ディレクトリを `node_modules` ディレクトリと同階層に作成し、`__mocks__` に mock module を配置します。こうすることでこの mock を全てのテストで使いまわすことができます。Jest は `__mocks__` 配下にある mock を自動的に使ってくれます。これに関する例示は、Jest 公式サイトにもそれからインターネットにもたくさんあります。このテストの manual mock を使った改善については、皆さんへの宿題として残しておくことにしますね。

## 結論

この記事では以下のことを扱ってきました。

- Jest の ES6 class mock の使用
- action の 成功/失敗時 のテスト

この記事のテストの完成形は[こちら](https://github.com/lmiller1990/vue-testing-handbook/blob/master/demo-app/tests/unit/actions.spec.js)にあります。
