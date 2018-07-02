## Emitting events

Talk about

- `emiitted().event` and `emitted('event')` syntax
- show how `emitted` is an array, containing another array of each argument the event emitted
- a simple example using `created` such as:

```js
created() {
  this.$emit("someEvent")
}

expect(emitted().someEvent).....)
```

アプリケーションを多くなれば大きくなるほど、コンポーネントも増えていきます。親と子どもコンポーネントをお互いにコミュニケーションをするとき、子どもがイベントを発火して、親は反応します。

`vue-test-utils`の`wrapper`APIの`emitted`メソッドで発火したイベントを簡単に検証できます。ドキュメンテーションは[こちら](https://vue-test-utils.vuejs.org/ja/api/wrapper/emitted.html)です。
