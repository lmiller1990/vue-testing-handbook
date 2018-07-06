## 発生したイベントのテスト

アプリケーションが多くなれば大きくなるほど、コンポーネントも増えていきます。親と子のコンポーネントをデータを共通するとき、子のコンポーネントがイベントを発火させて、親は反応します。

`vue-test-utils`の`wrapper`APIの`emitted`メソッドで発火したイベントを簡単に検証できます。ドキュメンテーションは[こちら](https://vue-test-utils.vuejs.org/ja/api/wrapper/emitted.html)です。

### コンポーネントとテストを書く

簡単のコンポーネントを書きながら学びましょう。`<Emitter>`というコンポーネントを作って、このコードを書きます。

```html
<template>
  <div>
  </div>
</template>

<script>
  export default {
    name: "Emitter",

    methods: { 
      emitEvent() {
        this.$emit("myEvent", "name", "password")
      }
    }
  }
</script>

<style scoped>
</style>
```

そして`emitEvent`を呼び出すメソッドがあるテストを書きます。

```js
import Emitter from "@/components/Emitter.vue"
import { shallowMount } from "@vue/test-utils"

describe("Emitter", () => {
  it("２つの引数があるイベントを発火する", () => {
    const wrapper = shallowMount(Emitter)

    wrapper.vm.emitEvent()

    console.log(wrapper.emitted())
  })
})
```

`vue-test-utils`の[`emitted`]APIでコンポーネントが発生したイベントが見えます。

`yarn test:unit`でテストを実行してみます。

```
PASS  tests/unit/Emitter.spec.js
Emitter
  ✓ ２つの引数があるイベントを発火する (31ms)

console.log tests/unit/Emitter.spec.js:10
  { myEvent: [ [ 'name', 'password' ] ] }
```

### emitted()のシンタックス

`emitted`はオブジェクトを返します。発生したイベントはプロパティになります。`emitted().[event]`で検証できます：

```js
emitted().myEvent //=>  [ [ 'name', 'password' ] ]
```

`emitEvent`を二回呼び出してみます。

```js
it("２つの引数があるイベントを発火する", () => {
  const wrapper = shallowMount(Emitter)

  wrapper.vm.emitEvent()
  wrapper.vm.emitEvent()

  console.log(wrapper.emitted().myEvent)
})
```

`yarn test:unit`で実行してみると：

```
console.log tests/unit/Emitter.spec.js:11
  [ [ 'name', 'password' ], [ 'name', 'password' ] ]
```

`emitted().emitEvent`は配列を返します。最初に発生したイベントは`emitted().emitEvent[0]`でアクセスできます。イベントの引数を`emitted().emitEvent[0][0]`などでアクセスできます。

テストでイベントが発生したかを検証してみます。

```js
it("２つの引数があるイベントを発火する", () => {
  const wrapper = shallowMount(Emitter)

  wrapper.vm.emitEvent()

  expect(wrapper.emitted().myEvent[0]).toEqual(["name", "password"])
})
```

テストはパスします。

### コンポーネントをマウントせずにイベントのテスト

たまにコンポーネントをレンダーせずにイベントが発生したかを`call`で検証できます。新しいテストを書きます。

```js
it("コンポーネントをレンダーせずにイベントを検証する", () => {
  const events = {}
  const $emit = (event, ...args) => { events[event] = [...args] }

  Emitter.methods.emitEvent.call({ $emit })

  expect(events.myEvent).toEqual(["name", "password"])
})
```

`$emit`はただのJavaScriptのオブジェクトなので、`$emit`をモックして、`call`で`emitEvent`の`this`につけます。

### まとめ
 
- `vue-test-utils`の`emitted`APIでコンポーネントによって発生したイベントを検証できます。
- `emitted`は関数です。呼び出したイベントは`emitted`が返すオブジェクトのプロパティになります。
- そのプロパティは配列です。イベントが数回発生したら、`[0]`、`[1]`などでアクセス
- 発生したイベントの引数も配列になります。`[0]`、`[1]`でアクセスします。
- `$emit`をモックして`call`で呼び出して、レンダーせずに検証できます。
