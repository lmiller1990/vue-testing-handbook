## 测试已发出的事件

随着应用规模的增长，其中组件的数量也会与日俱增。当这些组件间需要共享数据时，子组件可以 [发出（emit）](https://vuejs.org/v2/api/#vm-emit)  一个 _事件（event）_，而父组件会响应。

`vue-test-utils` 提供了一个 `emitted` API 以允许我们对已发出的事件作出断言。`emitted` 的文档可以在 [这里](https://vue-test-utils.vuejs.org/api/wrapper/emitted.html) 找到。

在本页中所描述的测试源码可以在 [这里](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/Emitter.spec.js) 找到。

## 编写组件及测试

先建立一个简单的组件。创建一个 `<Emitter>` 组件，并添加如下代码。

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

添加一个名为 `emitEvent` 的测试：

```js
import Emitter from "@/components/Emitter.vue"
import { shallowMount } from "@vue/test-utils"

describe("Emitter", () => {
  it("emits an event with two arguments", () => {
    const wrapper = shallowMount(Emitter)

    wrapper.vm.emitEvent()

    console.log(wrapper.emitted())
  })
})
```

通过使用 `vue-test-utils` 提供的 [emitted API](https://vue-test-utils.vuejs.org/ja/api/wrapper/emitted.html)，我们可以轻易地看到已发出的事件。

输入 `yarn test:unit` 运行测试。

```
PASS  tests/unit/Emitter.spec.js
● Console

  console.log tests/unit/Emitter.spec.js:10
    { myEvent: [ [ 'name', 'password' ] ] }
```

## emitted 语法

`emitted` 返回一个对象，其属性是已发出的各种事件。你可以通过 `emitted().[event]` 的方式检查事件：

```js
emitted().myEvent //=>  [ [ 'name', 'password' ] ]
```

让我们试着调用 `emitEvent` 两次。

```js
it("emits an event with two arguments", () => {
  const wrapper = shallowMount(Emitter)

  wrapper.vm.emitEvent()
  wrapper.vm.emitEvent()

  console.log(wrapper.emitted().myEvent)
})
```

用 `yarn test:unit` 运行测试：

```
console.log tests/unit/Emitter.spec.js:11
  [ [ 'name', 'password' ], [ 'name', 'password' ] ]
```

`emitted().myEvent` 返回了一个数组。事件实例可以通过 `emitted().myEvent[0]` 的形式访问到；参数可以用相似的语法访问到，如 `emitted().myEvent[0][0]` 等等。

让我们对已发出的事件做一条真正的断言。

```js
it("emits an event with two arguments", () => {
  const wrapper = shallowMount(Emitter)

  wrapper.vm.emitEvent()

  expect(wrapper.emitted().myEvent[0]).toEqual(["name", "password"])
})
```

测试通过了。

## 在不加载组件的情况下测试事件

有时你会想要在不真的加载组件的情况下测试已发出的事件。可以通过使用 `call` 来达到目的。让我们编写另一个测试。

```js
it("emits an event without mounting the component", () => {
  const events = {}
  const $emit = (event, ...args) => { events[event] = [...args] }

  Emitter.methods.emitEvent.call({ $emit })

  expect(events.myEvent).toEqual(["name", "password"])
})
```

因为 `$emit` 只是一个 JavaScript 对象，所以你可以 mock 掉 `$emit`，并通过使用 `call` 将其附加到 `emitEvent` 的 `this` 上下文中。通过使用 `call`，就可以在不加载组件的情况下调用一个方法了。

在组件中诸如 `created` 和 `mounted` 等生命周期中包含很重的处理逻辑而你又不想去执行它们的情况下，使用 `call` 是很有用的。因为不需加载组件，其生命周期方法也不会被调用。该方法在你想以一个特殊的方式操纵 `this` 上下文时同样有用。

## 总结

- 来自 `vue-test-utils` 的 `emitted` API 用于对已发出的事件作出断言
- `emitted` 是一个方法，返回一个以相应的已发出事件作为属性的对象
- `emitted` 的每个属性都是个数组。可以通过诸如 `[0]`、`[1]` 的数组语法访问每个已发出事件的实例
- 已发出事件的参数也被保存为数组，并能使用诸如 `[0]`、`[1]` 的数组语法访问到
- `$emit` 可以通过调用 `call` 被 mock 掉，assertions can be made without rendering the component

在本页中所描述的测试源码可以在 [这里](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/Emitter.spec.js) 找到。
