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
