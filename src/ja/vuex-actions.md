以下 URL の記事の翻訳です。

https://lmiller1990.github.io/vue-testing-handbook/vuex-actions.html#testing-for-the-api-error

Actions の単体テストは特に面倒なことなく実行できます。これは mutations の単体テストがシンプルに可能であることとよく似ています。mutation のテストについては以前の記事を参照してください。Component から actions を発行する test に関してはこの記事を参照してください。[こちら](https://lmiller1990.github.io/vue-testing-handbook/vuex-in-components-mutations-and-actions.html)

> Testing actions in isolation is very straight forward. It is very similar to testing mutations in isolation - see here for more on mutation testing. Testing actions in the context of a component is correctly dispatching them is discussed here.

このページで扱っている test は、このリポジトリにあります。[リポジトリ](https://github.com/lmiller1990/vue-testing-handbook/blob/master/demo-app/tests/unit/actions.spec.js)

> The source code for the test described on this page can be found here.

## アクションを作成する
Creating the Action

作成する action は一般的な Vuex パターンに従ったものです。

> We will write a action that follows a common Vuex pattern:

- API に対して非同期にコールをし、
- レスポンスデータに対してなんらかの加工をし、(必須ではありませんが)
- その結果を payload にのせて mutation に対して commit する。

> - make an asynchronous call to an API
> - do some proccessing on the data (optional)
> - commit a mutation with the result as the payload

つまりこれは認証をおこなう action で、username と password を外部の API に送って、それが正しいものかどうかを判断します。その結果を使って `SET_AUTHENTICATED` mutation にコミットし、state を変更します。

> This is an authenticate action, which sends a username and password to an external API to check if they are a match. The result is then used to update the state by committing a SET_AUTHENTICATED mutation with the result as the payload.

```js:title=action
import axios from "axios"

export default {
  async authenticate({ commit }, { username, password }) {
    const authenticated = await axios.post("/api/authenticate", {
      username, password
    })

    commit("set_authenticated", authenticated)
  }
}
```

この action のテストでは以下の項目を検査する必要があります。

> The action test should assert:

- API のエンドポイントは正しいか
- payload は正しいか
- `commit` の結果引き起こされた `mutaiton` は正しいものだったか

> - was the correct API endpoint used?
> - is the payload correct?
> - was the correct mutation committed with the result
 
ではまずはテストを書いてから、その失敗メッセージに従って進めていきましょう。

- Let's go ahead and write the test, and let the failure messages guide us.

# Writing the Test

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

> Since axios is asynchronous, to ensure Jest waits for test to finish we need to declare it as async and then await the call to actions.authenticate. Otherwise the test will finish before the expect assertion, and we will have an evergreen test - a test that can never fail.

上記テストを実行すると以下のようなテスト失敗のメッセージが表示されます。

> Running the above test gives us the following failure message:

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

> This error is coming somewhere from within axios. We are making a request to /api..., and since we are running in a test environment, there isn't even a server to make a request to, thus the error. We also did not defined url or body - we will do that while we solve the axios error.

このシリーズ記事では、Jest をテストツールに使用しているので、Jest の mock 機能である jest.mock を使うことで容易にに API の呼び出しをモック化することができます。本当の Axios ではなく、それをモック化したものを使うことで、よりその挙動をコントロールすることができるのです。Jest の提供する ES6 Class Mock が、Axios をモック化するのに最適な機能です。

> Since we are using Jest, we can easily mock the API call using jest.mock. We will use a mock axios instead of the real one, which will give us more control over it's behavior. Jest provides ES6 Class Mocks, which are a perfect fit for mocking axios.

Axios のモックは次のようなコードになります。

> The axios mock looks like this:

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

> We save url and body to variables to we can assert the correct endpoint is receiving the correct payload. Since we don't actually want to hit a real endpoint, we resolve the promise immediately which simulates a successful API call.
 
`yarn unit:pass` を実行してみると、やっとテストが通りますね！

> yarn unit:pass now yields a passing test!

# API のエラー時のテストを書く 
> Testing for the API Error

API の呼び出しが「成功」した場合のみをテストしてきました。しかし、考えうる結果すべてをテストすることが非常に重要です。ですから、Error が発生した場合のテストを書いていくことにしましょう。今回もまずはテストを書いて、それに従って API を実装していくことしましょう。

> We only tested the case where the API call succeed. It's important to test all the possible outcomes. Let's write a test for the case where an error occurs. This time, we will write the test first, followed by the implementation.

テストは次のように書くことができるでしょう。

> The test can be written like this:

```js:title=Jest による test
it("catches an error", async () => {
  mockError = true

  await expect(actions.authenticate({ commit: jest.fn() }, {}))
    .rejects.toThrow("API Error occurred.")
})
```

axios mock に強制的に `thow an error` させる必要があります。そのために `mockError` 変数を用意します。次のように書き換えましょう。

> We need to find a way to force the axios mock to throw an error. That's what the mockError variable is for. Update the axios mock like this:

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

> Jest will only allow accessing an out of scope variable in an ES6 class mock if the variable name is prepended with mock. Now we can simply do mockError = true and axios will throw an error.
 
すると次のようなエラーがでるはずです。

> Running this test gives us this failing error:

```
FAIL  tests/unit/actions.spec.js
● authenticate › catchs an error

  expect(function).toThrow(string)

  Expected the function to throw an error matching:
    "API Error occurred."
  Instead, it threw:
    Mock error
```

エラーはうまく起こせましたが、期待した挙動にはなっていませんね。authenticate メソッドを修正し、期待した eroor が throw されるように修正しましょう。

> It successfully caught the an error... but not the one we expected. Update authenticate to throw the error the test is expecting:

```js:title=action を修正する
export default {
  async authenticate({ commit }, { username, password }) {
    try {
      const authenticated = await axios.post("/api/authenticate", {
        username, password
      })

      commit("SET_AUTHENTICATED", authenticated)
    } catch (e) {
      throw Error("API Error occurred.")
    }
  }
}
```

これでテストが通るようになりましたね。

> Now the test is passing.

# 改良
> Improvements
 
Action を単体テストすることができました。ただし、このテストは少なくとも一箇所、大幅に改善できる余地が残されています。それは axios の mock を manual mock として実装することです。`__mocks__` ディレクトリを `node_modules` ディレクトリと同階層に作成し、`__mocks__` に mock module を配置します。こうすることでこの mock を全てのテストで使いまわすことができます。Jest は `__mocks__` 配下にある mock を自動的に使ってくれます。これに関する例示は、Jest 公式サイトにもそれからインターネットにもたくさんあります。このテストの manual mock を使った改善については、皆さんへの宿題として残しておくことにしますね。

> Now you know how to test actions in isolation. There is at least one potential improvement that can be made, which is to implement the axios mock as a manual mock. This involves creating a __mocks__ directory on the same level as node_modules and implementing the mock module there. By doing this, you can share the mock implementation across all your tests. Jest will automatically use a __mocks__ mock implementation. There are plenty of examples on the Jest website and around the internet on how to do so. Refactoring this test to use a manual mock is left as an exercise to the reader.

# 結論
>Conclusion

この記事では以下のことを扱ってきました。

> This guide discussed:

- Jest の ES6 class mock の使用
- action の 成功/失敗時 のテスト

> - using Jest ES6 class mocks
> - testing both the success and failure cases of an action
 
この記事のテストの完成形は[こちら](https://github.com/lmiller1990/vue-testing-handbook/blob/master/demo-app/tests/unit/actions.spec.js)にあります。

> The source code for the test described on this page can be found here.
