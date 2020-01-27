## 전역 객체 모킹

`vue-test-utils`는 테스트 기준으로 `Vue.prototype`에 부착한 전역 객체를 mock 하거나, 모든 테스트의 default mock을 설정하는 간단한 방법을 제공합니다.

예제에서 사용한 테스트는 [여기](https://github.com/lmiller1990/vue-testing-handbook/blob/master/demo-app/tests/unit/Bilingual.spec.js)에서 찾을 수 있습니다.

## mocks 마운팅 옵션

[mocks 마운팅 옵션](https://vue-test-utils.vuejs.org/api/options.html#mocks)은 `Vue.prototype`에 부착한 임의의 프로퍼티의 값을 설정하는 한 가지 방법입니다. 일반적으로 아래의 내용을 포함합니다.

- Vuex를 위한 `$store`
- Vue Router를 위한 `$router`
- Vue-i18n을 위한 `$t`

이 외에도 많은 것들이 있습니다.

## vue-i18n 예제

Vuex와 Vue Router에서 사용하는 방법은 각각의 세션([Vuex](https://lmiller1990.github.io/vue-testing-handbook/vuex-in-components.html)와 [Vue Router](https://lmiller1990.github.io/vue-testing-handbook/vue-router.html))에서 얘기했습니다. [vue-i18n](https://github.com/kazupon/vue-i18n) 예제를 보겠습니다. `createLocalVue`를 사용하고, 각 테스트에 `vue-i18n`을 설치할 수도 있지만, 빠르게 무거워지고 많은 보일러플레이트를 생성할 수 있습니다. 첫 번째는 `vue-i18n`을 사용하는  `<Bilingual>` 컴포넌트입니다.

```html
<template>
  <div class="hello">
    {{ $t("helloWorld") }}
  </div>
</template>

<script>
  export default {
    name: "Bilingual"
  }
</script>
```

`vue-i18n`은 다른 파일에서 사용할 번역문을 명시하고, `$t`로 해당 번역문을 참조하는 방식으로 동작합니다. 이 테스트의 목적을 위해서 번역문 파일이 어떻게 생겼는지는 중요하지 않습니다만, 컴포넌트를 테스트하기 위해서 아래와 같은 예제를 만들겠습니다.

```js
export default {
  "en": {
    helloWorld: "Hello world!"
  },
  "ja": {
    helloWorld: "こんにちは、世界！"
  }
}
```

locale을 바탕으로 올바른 번역문을 렌더합니다. 어떤 것도 모킹(mocking) 하지 않고, 테스트에서 컴포넌트를 렌더 해보겠습니다.

```js
import { shallowMount } from "@vue/test-utils"
import Bilingual from "@/components/Bilingual.vue"

describe("Bilingual", () => {
  it("성공적으로 렌더한다", () => {
    const wrapper = shallowMount(Bilingual)
  })
})
```

`yarn test:unit`으로 이 테스트를 실행하면, 거대한 스택 트레이스(stack trace)를 던집니다. 결과를 주의 깊게 살펴보면, 아래와 같은 메시지를 볼 수 있습니다.

```
[Vue warn]: Error in config.errorHandler: "TypeError: _vm.$t is not a function"
```

`vue-i18n`을 설치하지 않았기 때문입니다. 그래서 전역 `$t` 메서드는 존재하지 않습니다. `mocks` 마운팅 옵션을 사용해서 해당 메서드를 mock 해보겠습니다.

```js
import { shallowMount } from "@vue/test-utils"
import Bilingual from "@/components/Bilingual.vue"

describe("Bilingual", () => {
  it("성공적으로 렌더한다", () => {
    const wrapper = shallowMount(Bilingual, {
      mocks: {
        $t: (msg) => msg
      }
    })
  })
})
```

이제 테스트가 통과합니다! `mocks` 옵션에는 많은 사용 방법이 있습니다. 제가 제일 많이 사용하는 방법은, 위에서 언급한 세 가지 패키지에서 제공하는 전역 객체를 모킹 하는 것입니다.

## config을 사용해서 default mocks 설정하기

때로는 mock을 위한 기본값을 가지고 싶어서, 테스트 기준으로 mock을 생성하지 않기를 원할 수도 있습니다. `vue-test-utils`에서 제공하는 [config](https://vue-test-utils.vuejs.org/api/#config) API를 사용해서 이 일을 할 수 있습니다. `vue-i18n` 예제를 확장해 보겠습니다. 아래와 같이 설정함으로써 어디서든지 default mocks를 설정할 수 있습니다.

```js
import VueTestUtils from "@vue/test-utils"

VueTestUtils.config.mocks["mock"] = "Default Mock Value"
```

이 가이드를 위한 데모 프로젝트는 Jest를 사용하고 있습니다. 그래서 `jest.init.js`에서 기본 mock을 선언하겠습니다. 해당 mock은 테스트가 자동으로 실행되기 전에 불러와 집니다. 또한 예제인 translations 객체를 앞에서 가져와서 mock 구현에 사용하겠습니다.

```js
import VueTestUtils from "@vue/test-utils"
import translations from "./src/translations.js"

const locale = "en"

VueTestUtils.config.mocks["$t"] = (msg) => translations[locale][msg]
```

이제 모킹한 `$t` 함수를 사용했음에도 불구하고 진짜 번역문을 렌더합니다. 이번에는 `wrapper.html()`에 `console.log`를 사용해서 테스트를 다시 실행하겠습니다. 그리고 `mocks` 마운팅 옵션을 제거하겠습니다.

```js
describe("Bilingual", () => {
  it("성공적으로 렌더한다", () => {
    const wrapper = shallowMount(Bilingual)

    console.log(wrapper.html())
  })
})
```

테스트가 통과합니다. 그리고 아래와 같은 마크업이 렌더됩니다.

```
<div class="hello">
  Hello world!
</div>
```

Vuex를 테스트하기 위해 `mocks`를 사용하는 방법은 [여기](https://lmiller1990.github.io/vue-testing-handbook/vuex-in-components.html#using-a-mock-store)서 읽어볼 수 있습니다. 테크닉 자체는 같습니다.

## 결론

이 가이드는 아래의 내용에 관해 얘기했습니다.

- 테스트 기준으로 전역 객체를 모킹하기 위한 `mocks` 사용하기
- default mock을 설정하기 위한 `config.mocks` 사용하기
