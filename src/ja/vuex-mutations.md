## Mutation をテストする

Mutation のテストだけを独立しておこなう場合には、複雑な手順は全く必要ありません。Mutation は通常の JavasScript の関数の範囲で書かれているからです。このページでは Mutation だけの独立したテストについて取り上げます。コンポーネントが Mutation に commit する際の Mutation のテストをしたい場合には、[こちら](https://lmiller1990.github.io/vue-testing-handbook/ja/vuex-in-components-mutations-and-actions.html)をご覧ください。

このページで実装していくテストの完成形のコードは[このリポジトリ](https://github.com/lmiller1990/vue-testing-handbook/blob/master/demo-app/tests/unit/mutations.spec.js)にも配置してあります。

## Mutation を作成する

Mutation は基本的には次のような定型パターンをとります。つまり、情報を受け取って、その情報に対していくつかの処理をして、そしてその加工された情報を state に割り当てます。次のコードは `ADD_POST` mutation の大枠です。まだ大枠しか書かれていませんが、この Mutation の実装が完成した際には、Mutation は `payload` として送られてきた `post` オブジェクトをとして受け取り、`post.id` を `state.postIds` に追加します。同時に `post` オブジェクトを `state.posts` オブジェクトに対して、key が `post.id` となるプロパティとして追加します。これは Vuex を用いたアプリケーションにおいてよく取られる手法です。 

ではこの mutation を TDD の手法に則って開発していきましょう。まずは mutation を以下のように書いて始めましょう。 

```js
export default {
  SET_USER(state, { post }) {

  }
}
```

次にテストを書くことにしましょう。テストのエラーメッセージを参考にしながら開発を進めます。

```js
import mutations from "@/store/mutations.js"

describe("SET_POST", () => {
  it("adds a post to the state", () => {
    const post = { id: 1, title: "Post" }
    const state = {
      postIds: [],
      posts: {}
    }

    mutations.SET_POST(state, { post })

    expect(state).toEqual({
      postIds: [1],
      posts: { "1": post }
    })
  })
})
```

`yarn test:unit`　を実行してテストを走らせます。すると、次のようなテスト失敗に関するメッセージが表示されます。

```
FAIL  tests/unit/mutations.spec.js
● SET_POST › adds a post to the state

  expect(received).toEqual(expected)

  Expected value to equal:
    {"postIds": [1], "posts": {"1": {"id": 1, "title": "Post"}}}
  Received:
    {"postIds": [], "posts": {}}
```

ではメッセージを参考に、 `post.id` を `state.postIds` に追加することにしましょう。

```js
export default {
  SET_POST(state, { post }) {
    state.postIds.push(post.id)
  }
}
```

変更したら再度 `yarn test:unit` を実行すると、次のようなメッセージが表示されはずです。

```
Expected value to equal:
  {"postIds": [1], "posts": {"1": {"id": 1, "title": "Post"}}}
Received:
  {"postIds": [1], "posts": {}}
```

`postIds` は良いみたいですね。しかし `state.posts` 関しては post が本来追加されていないといけませんね。このように期待しない挙動になってしまっているのは、Vue のリアクティビティシステムが、単に `post[post.id] = post` と書くだけでは機能しないからです。より詳しくは[こちら](https://jp.vuejs.org/v2/guide/reactivity.html#%E5%A4%89%E6%9B%B4%E6%A4%9C%E5%87%BA%E3%81%AE%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A0%85)をご覧ください。これに対応するためには、新しいオブジェクトを `Object.assign` もしくは `...` オペレーターを使って生成すれば良いでしょう。このガイドでは `...` を使って post を `state.posts` にアサインしていきます。

```js
export default {
  SET_POST(state, { post }) {
    state.postIds.push(post.id)
    state.posts = { ...state.posts, [post.id]: post }
  }
}
```

さあ、これでテストが通りましたね！

## 結論

Vuex の mutation に対するテストには、Vue もしくは Vuex 特有の要素は一切ありません。なぜなら mutation は JavaScript の普通の関数だからです。単に mutation を import して、必要なテストをすればいいだけです。唯一注意しなければいけないことがあるとすれば、Vue のリアクティビティに関するクセです。このクセが Vuex にも影響しています。Vue のリアクティビティシステムに関してより詳しく知りたい場合には[こちら](https://jp.vuejs.org/v2/guide/reactivity.html#%E5%A4%89%E6%9B%B4%E6%A4%9C%E5%87%BA%E3%81%AE%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A0%85)を読んでください。

このページが扱ってきた内容をまとめると次のようになります。

- Vuex の mutation は通常の JavaScript の関数である
- Mutation はメインの Vue アプリケーションとは切り離した状態でテストすることができ、またそうしたほうがよい

このページで作成したテストは[ここ](https://github.com/lmiller1990/vue-testing-handbook/blob/master/demo-app/tests/unit/mutations.spec.js)でみることができます。
