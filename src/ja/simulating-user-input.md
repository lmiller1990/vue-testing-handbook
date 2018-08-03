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

ユーザーはフォームを送信すると、メッセージを表示させます。フォームを同期的に送信するので、`@submit.prevent`で送信します。そうしないと、デフォルトアクションが走ります。フィームを送信するとデフォルトアクションはページをリフレッシュします。

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

このテストはユニットテストの３つのステップで分けました：

1. `arrange` (初期設定) - テストの準備。この場合、コンポーネントをレンダーします
2. `act` (実行) - システムを実行します。
3. `assert` (検証）- 期待と検証を比べます。

ステップずつテストを分けるのが好きです。読みやすくなると思います。

`yarn test:unit`で実行すると、パスするはずです。 
