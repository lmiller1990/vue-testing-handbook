## emitted 이벤트 테스트하기

애플리케이션이 커질수록, 컴포넌트의 수도 많아질 것입니다. 컴포넌트가 데이터를 공유하는 일이 필요할때 자식 컴포넌트는 이벤트를 [방출(emit)](https://vuejs.org/v2/api/#vm-emit)합니다. 그리고 부모 컴포넌트는 해당 이벤트에 응답합니다.

`vue-test-utils`는 `emitted` API를 제공합니다. `emitted` API는 방출 이벤트를 어설션(assertion) 할 수 있도록 해줍니다. `emitted`에 대한 문서는 [여기](https://vue-test-utils.vuejs.org/api/wrapper/emitted.html)서 찾을 수 있습니다.

이 페이지에 설명된 테스트의 소스 코드는 [여기](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/Emitter.spec.js)서 찾을 수 있습니다.

## 컴포넌트를 작성하고 테스트하기

간단한 컴포넌트를 만들어 보겠습니다. `<Emitter>` 컴포넌트를 생성하고 아래와 같은 코드를 추가합니다.

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

`emitEvent`를 호출하는 테스트를 추가하겠습니다.

```js
import Emitter from "@/components/Emitter.vue"
import { shallowMount } from "@vue/test-utils"

describe("Emitter", () => {
  it("두 개의 인자를 가진 이벤트를 방출한다", () => {
    const wrapper = shallowMount(Emitter)

    wrapper.vm.emitEvent()

    console.log(wrapper.emitted())
  })
})
```
`vue-test-utils`에서 제공하는 [emitted API](https://vue-test-utils.vuejs.org/ja/api/wrapper/emitted.html)를 사용해서, 방출한 이벤트를 쉽게 확인할 수 있습니다.

`yarn test:unit`으로 테스트를 실행하겠습니다.

```
PASS  tests/unit/Emitter.spec.js
● Console

  console.log tests/unit/Emitter.spec.js:10
    { myEvent: [ [ 'name', 'password' ] ] }
```

## emitted 문법

`emitted`는 객체를 반환합니다. 방출한 이벤트는 객체의 프로퍼티로 저장됩니다. `emitted().[event]`를 사용해서 이벤트를 검사할 수 있습니다.

```js
emitted().myEvent //=>  [ [ 'name', 'password' ] ]
```

`emitEvent`를 두 번 호출해보겠습니다.

```js
it("두 개의 인자를 가진 이벤트를 방출한다", () => {
  const wrapper = shallowMount(Emitter)

  wrapper.vm.emitEvent()
  wrapper.vm.emitEvent()

  console.log(wrapper.emitted().myEvent)
})
```

`yarn test:unit`으로 테스트를 실행하겠습니다.

```
console.log tests/unit/Emitter.spec.js:11
  [ [ 'name', 'password' ], [ 'name', 'password' ] ]
```

`emitted().emitEvent`는 배열을 반환합니다. `emitEvent`의 첫 번째 인스턴스는 `emitted().emitEvent[0]`을 사용해서 접근할 수 있습니다. 인자도  `emitted().emitEvent[0][0]`과 같이 비슷한 문법을 사용해서 접근할 수 있습니다.

emitted 이벤트에 대한 실제 어설션을 만들어 보겠습니다.


```js
it("두 개의 인자를 가진 이벤트를 방출한다", () => {
  const wrapper = shallowMount(Emitter)

  wrapper.vm.emitEvent()

  expect(wrapper.emitted().myEvent[0]).toEqual(["name", "password"])
})
```

테스트는 통과합니다.

## 컴포넌트를 마운트 하지 않고 이벤트 테스트하기

때로는 컴포넌트를 실제로 마운트 하지 않고, 방출 이벤트를 테스트하고 싶을 수도 있습니다. `call`을 사용해서 이 일을 할 수 있습니다. 또 다른 테스트를 작성해보겠습니다.

```js
it("컴포넌트를 마운트 하지 않고 이벤트를 방출한다", () => {
  const events = {}
  const $emit = (event, ...args) => { events[event] = [...args] }

  Emitter.methods.emitEvent.call({ $emit })

  expect(events.myEvent).toEqual(["name", "password"])
})
```

`$emit`은 단지 자바스크립트 객체이기 때문에, `$emit`을 mock 할 수 있습니다. `call`을 사용해서 `emitEvent`의  `this` 컨텍스트에 $emit을 붙일 수 있습니다. `call`을 사용해서 컴포넌트를 마운트 하지 않고, 메서드를 호출할 수 있습니다.

`call`은 실행하고 싶지 않은 `created`나 `mounted` 같은 라이프사이클 메서드에서, 무거운 작업을 처리해야 하는 상황에 사용하면 유용합니다. 컴포넌트를 마운트하지 않기 때문에, 라이프사이클 메서드는 절대 호출되지 않습니다. 특정 방식으로 `this` 컨텍스트를 조작하고 싶을 때도 유용합니다.

## 결론

- `vue-test-utils`의 `emitted` API는 emitted 이벤트에 대한 어설션을 할 때 사용합니다
- `emitted`는 메서드입니다. emitted 이벤트에 반응해서 프로퍼티를 가진 객체를 반환합니다
- `emitted`의 각각의 프로퍼티는 배열입니다. `[0]`, `[1]` 배열 문법을 사용해서 각각의 emitted 이벤트의 인스턴스에 접근할 수 있습니다
- emitted 이벤트의 인자도 배열로 저장됩니다. `[0]`,`[1]`같은 배열 문법을 사용해서 접근할 수 있습니다
- `$emit`은 `call`을 사용해서 mock 할 수 있습니다. 어설션은 컴포넌트를 렌더하지 않고 이뤄집니다.

이 페이지에 설명한 테스트의 소스코드는 [여기](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/Emitter.spec.js)서 발견할 수 있습니다.
