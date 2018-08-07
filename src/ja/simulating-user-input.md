## Triggering Events

Vueコンポーネントの中でよくやることの１つはユーザーが発生したイベントをハンドルすることです。`vue-test-utils`とJestでイベントのテストを書きやすくします。`trigger`とJestのモック関数を使ってコンポーネントのテストを書いてみましょう。

このページのテストのそーすこーどは[こちら](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/FormSubmitter.spec.js)です。

## コンポーネントを作成する

`<input>`と`<button>`がある簡単な`<FormSubmitter>`コンポーネントを作ります。ボタンをクリックすると、何かが起こります。最初の例にボタンをクリックすると成功メッセージを表示します。次の例にボタンをクリックするとデータを外部サービスに送信します。

`<FormSubmitter>`を作って、テンプレートにこう書きます：

```html
<template>
  <div>
    <form @submit.prevent="handleSubmit">
      <input v-model="username" data-username>
      <input type="submit">
    </form>

    <div 
      class="message" 
      v-show="submitted"
    >
      {{ username }}お問い合わせ、ありがとうございます。
    </div>
  </div>
</template>
```

ユーザーはフォームを送信すると、メッセージを表示させます。フォームを非同期に送信するので、`@submit.prevent`で送信します。そうしないと、デフォルトアクションが走ります。フォームを送信するとデフォルトアクションはページを更新します。

フォームを送信するロジックを追加します：

```html
<script>
  export default {
    name: "FormSubmitter",

    data() {
      return {
        username: '',
        submitted: false
      }
    },

    methods: {
      handleSubmit() {
        this.submitted = true
      }
    }
  }
</script>
```

簡単です。送信すると`submitted`を`true`にするだけです。

## テストを書く

テストをこう書きます：

```js
import { shallowMount } from "@vue/test-utils"
import FormSubmitter from "@/components/FormSubmitter.vue"

describe("FormSubmitter", () => {
  it("reveals a notification when submitted", () => {
    const wrapper = shallowMount(FormSubmitter)

    wrapper.find("[data-username]").setValue("alice")
    wrapper.find("form").trigger("submit.prevent")

    expect(wrapper.find(".message").text())
      .toBe("Thank you for your submission, alice.")
  })
})
```

テストがわかりやすいです。コンポーネントをマウントして、`username`を`setValue`で入力して、そして`vue-test-utils`の`trigger`を使って送信することシミュレーションします。`trigger`をカスタムイベントにも使えるので`submit.prevent`や`myEvent.doSomething`でも問題ないです。

このテストはユニットテストの３つの改行で分けました：

1. `arrange` (初期設定) - テストの準備。この場合、コンポーネントをレンダーします
2. `act` (実行) - システムを実行します。
3. `assert` (検証）- 期待と検証を比べます。

ステップずつテストを分けるのが好きです。読みやすくなると思います。

`yarn test:unit`で実行すると、パスするはずです。 

`trigger`の使い方は簡単です。ただイベントを発生させたい要素を`find`で検証して、イベント名を`trigger`に渡して呼び出します。

## 実例

アプリにフォームがよくあります。フォームのデータをエンドポイントに送信します。`handleSubmit`の実装を更新して、`axios`というよく使われるHTTPクライエントで送信してみます。そしてそのコードのテストを書きます。

`axios`を`Vue.prototype.$http`にエイリアスすることもよくあります。詳しくは[こちら](https://jp.vuejs.org/v2/cookbook/adding-instance-properties.html)。こうすると、`this.$http.get`を呼び出すだけでデータをエンドポイントに送信できます。

エイリアスして、`this.$http`でフォームを送信する実装はこうです。

```js
handleSubmitAsync() {
  return this.$http.get("/api/v1/register", { username: this.username })
    .then(() => {
      // メッセージを表示するなど
    })
    .catch(() => {
      // エラーをハンドル
    })
}
```

`this.$http`をモックしたら、上のコードを簡単にテストできます。モックするには`mocks`マウンティングオプションを使えます。`mocks`ついて詳しくは[こちら](https://vue-test-utils.vuejs.org/ja/api/options.html#mocks)。`http.get`のモック実装はこうです。

```js
let url = ''
let data = ''

const mockHttp = {
  get: (_url, _data) => {
    return new Promise((resolve, reject) => {
      url = _url
      data = _data
      resolve()
    })
  }
}
```

いくつかの面白い点があります。

- `$http.get`に渡す`url`と`data`を保存するために`url`と`data`変数を作ります。そうすると、`handleSubmitAsync`を呼び出すとたたしいエンドポイントと正しいペイロードで動くか検証できます。- `url`と`data`をアサインしてから、`Promise`をすぐに`resolve`（解決）します。これは正解となったレスポンスのシミュレーションです。

テストを書く前に、`handleSubmitAsync`を更新します：

```js
methods: {
  handleSubmitAsync() {
    return this.$http.get("/api/v1/register", { username: this.username })
      .then(() => {
        this.submitted = true
      })
      .catch((e) => {
        throw Error("Something went wrong", e)
      })
  }
}
```

そして`<template>`を更新して、新しい`handleSubmitAsync`を使います：

```html
<template>
  <div>
    <form @submit.prevent="handleSubmitAsync">
      <input v-model="username" data-username>
      <input type="submit">
    </form>

  <!-- ... -->
  </div>
</template>
```

テスを書きましょう。

## AJAXコールをモックする

