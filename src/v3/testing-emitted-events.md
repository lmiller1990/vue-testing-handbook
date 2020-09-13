:::tip This book is written for Vue.js 3 and Vue Test Utils v2.
Find the Vue.js 2 version [here](/).
:::

## Testing Emitted Events

As applications grow larger, the number of components grows as well. When these components need to share data, child components can [emit](https://vuejs.org/v2/api/#vm-emit) an event, and the parent component responds.

`vue-test-utils` provides an `emitted` API which allows us to make assertions on emitted events. The documentation for `emitted` is found [here](https://vue-test-utils.vuejs.org/api/wrapper/emitted.html).

The source code for the test described on this page can be found [here](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/Emitter.spec.js).

## Write a Component and Test

Let's build a simple component. Create an `<Emitter>` component, and add the following code.

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

Add a test called `emitEvent`:

```js
import Emitter from "@/components/Emitter.vue"
import { mount } from "@vue/test-utils"

describe("Emitter", () => {
  it("emits an event with two arguments", () => {
    const wrapper = mount(Emitter)

    wrapper.vm.emitEvent()

    console.log(wrapper.emitted())
  })
})
```
Using the [emitted API](https://vue-test-utils.vuejs.org/ja/api/wrapper/emitted.html) provided by `vue-test-utils`, we can easily see the emitted events.

Run the test with `yarn test:unit`.

```
PASS  tests/unit/Emitter.spec.js
● Console

  console.log tests/unit/Emitter.spec.js:10
    { myEvent: [ [ 'name', 'password' ] ] }
```

## emitted syntax

`emitted` returns an object. The emitted events are saved as properties on the object. You can inspect the events using `emitted().[event]`:

```js
emitted().myEvent //=>  [ [ 'name', 'password' ] ]
```

Let's try calling `emitEvent` twice.

```js
it("emits an event with two arguments", () => {
  const wrapper = mount(Emitter)

  wrapper.vm.emitEvent()
  wrapper.vm.emitEvent()

  console.log(wrapper.emitted().myEvent)
})
```

Run the test with `yarn test:unit`:

```
console.log tests/unit/Emitter.spec.js:11
  [ [ 'name', 'password' ], [ 'name', 'password' ] ]
```

`emitted().emitEvent` returns an array. The first instance of `emitEvent` is accessible using with `emitted().emitEvent[0]`. The arguments are accessible using a similar syntax, `emitted().emitEvent[0][0]` and so forth. 

Let's make an actual assertion against the emitted event.


```js
it("emits an event with two arguments", () => {
  const wrapper = mount(Emitter)

  wrapper.vm.emitEvent()

  expect(wrapper.emitted().myEvent[0]).toEqual(["name", "password"])
})
```

The test passes.

## Testing events without mounting the component

Some times you might want to test emitted events without actually mounting the component. You can do this by using `call`. Let's write another test.

```js
it("emits an event without mounting the component", () => {
  const events = {}
  const $emit = (event, ...args) => { events[event] = [...args] }

  Emitter.methods.emitEvent.call({ $emit })

  expect(events.myEvent).toEqual(["name", "password"])
})
```

Since `$emit` is just a JavaScript object, you can mock `$emit`, and by using `call` to attach it to the `this` context of `emitEvent`. By using `call`, you can call a method without mounting the component. 

Using `call` can be useful in situations where you have some heavy processing in lifecycle methods like `created` and `mounted` that you don't want to execute. Since you don't mount the component, the lifecycle methods are never called. It can also be useful when you want to manipulate the `this` context in a specific manner.

Generally, you don't want to call the method manually like we are doing here - if your component emits an event when a button is clicked, then you probably want to do `wrapper.find('button').click()` instead. This article is just to demonstrate some other techniques.

## Conclusion

- the `emitted` API from `vue-test-utils` is used to make assertions against emitted events
- `emitted` is a method. It returns an object with properties corresponding to the emitted events
- each property of `emitted` is an array. You can access each instance of an emitted event by using the `[0]`, `[1]` array syntax
- the arguments of emitted events are also saved as arrays, and can accessed using the `[0]`, `[1]` array syntax
- `$emit` can be mocked using `call`, assertions can be made without rendering the component

The source code for the test described on this page can be found [here](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/Emitter.spec.js).
