## Vue 라우터

라우터가 보통 함께 작동하는 여러 컴포넌트를 포함하다 보니, 종종 라우팅 테스트는 e2e/통합 테스트 수준 같은 [testing pyramid](https://www.freecodecamp.org/news/the-front-end-test-pyramid-rethink-your-testing-3b343c2bca51/) 위에서 진행됩니다. 하지만 라우팅에 대한 몇 가지 유닛 테스트를 하는 것도 도움이 될 수 있습니다.

이전 세션에서 얘기했던 것과 비슷하게, 라우터와 상호 작용하는 컴포넌트를 테스트하는 두 가지 방법이 있습니다.

1. 실제 라우터 인스턴스 사용하기
2. `$route`와 `$router` 글로벌 객체 모킹하기

대부분의 Vue 어플리케이션이 공식 Vue 라우터를 사용하기 때문에, 이 가이드는 거기에 초점을 맞추겠습니다.

이 페이지에서 설명한 테스트의 소스 코드는 [여기](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/App.spec.js)와 [여기](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/NestedRoute.spec.js)에서 찾을 수 있습니다.

## 컴포넌트 생성하기

`/nested-child` 라우트를 가진 간단한 `<App>`을 만들어보겠습니다.  `/nested-child`에 방문하면 `<NestedRoute>` 컴포넌트를 렌더합니다.  `App.vue` 파일을 생성하고 아래의 축소된 컴포넌트를 삽입하겠습니다.

```vue
<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>

export default {
  name: 'app'
}
</script>
```

`<NestedRoute>`도 아래와 같이 축소된 형태입니다.

```vue
<template>
  <div>Nested Route</div>
</template>

<script>
export default {
  name: "NestedRoute"
}
</script>
```

## 라우터와 라우트 생성하기

이제 테스트할 몇 가지 라우트가 필요합니다. 라우트부터 시작하겠습니다.

```js
import NestedRoute from "@/components/NestedRoute.vue"

export default [
  { path: "/nested-route", component: NestedRoute }
]
```

실제 앱에서는 보통 `router.js` 파일을 생성하고 작성한 라우트를 import 합니다. 그리고 아래와 같이 작성합니다.

```js
import Vue from "vue"
import VueRouter from "vue-router"
import routes from "./routes.js"

Vue.use(VueRouter)

export default new VueRouter({ routes })
```

테스트에서 `Vue.use(...)`를 호출해서 전역 네임스페이스를 오염시키고 싶지는 않기 때문에, 테스트 기준에서 라우터를 생성하겠습니다. 생성한 라우터는 유닛 테스트를 진행하는 동안 앱의 상태를 좀 더 유연하게 통제할 수 있도록 해줄 것입니다.

## 테스트 작성하기

몇 가지 코드를 보고 나서, 어떤 일인지에 관해 얘기해보겠습니다.  `App.vue`를 테스트하고 있고, `App.spec.js`에 아래의 내용을 추가합니다.

```js
import { shallowMount, mount, createLocalVue } from "@vue/test-utils"
import App from "@/App.vue"
import VueRouter from "vue-router"
import NestedRoute from "@/components/NestedRoute.vue"
import routes from "@/routes.js"

const localVue = createLocalVue()
localVue.use(VueRouter)

describe("App", () => {
  it("라우팅을 통해서 자식 컴포넌트를 렌더한다", async () => {
    const router = new VueRouter({ routes })
    const wrapper = mount(App, { 
      localVue,
      router
    })

    router.push("/nested-route")
    await wrapper.vm.$nextTick()

    expect(wrapper.find(NestedRoute).exists()).toBe(true)
  })
})
```

* 테스트에 `await`을 표시하고 `nextTick`을 호출한 것을 주목하세요. 그 이유에 대한 자세한 설명은 [여기](/simulating-user-input.html#writing-the-test)에서 볼 수 있습니다.

평상시처럼 테스트를 위한 다양한 모듈을 import 하면서 시작합니다. 두드러지는 부분은 애플리케이션에서 사용할 실제 라우트를 추출하고 있는 것입니다. 이 방법은 다음과 같은 부분에서 이상적입니다. 실제 라우팅이 망가진다면, 유닛 테스트는 실패할 것이고, 애플리케이션을 배포하기 전에 해당 문제를 고칠 수 있습니다.

모든 `<App>` 테스트에서 같은 `localVue`를 사용할 수 있습니다. 그래서 localVue는 처음 `describe` 블록 밖에서 선언됩니다. 그렇지만, 다른 라우트에 대한 테스트를 하고 싶을지도 모르기 때문에, 라우터는 `it` 블록 내에서 정의돼야 합니다.

여기서 이 문서에 있는 다른 가이드와 구별되는 주목할만한 부분은 `shallowMount` 대신 `mount`를 사용하고 있다는 점입니다. `shallowMount`를 사용한다면 현재 라우트와 무관하게, `<router-link>`는 스텁(stub)되지 않을 것입니다. 그리고 쓸모없는 스텁 컴포넌트가 렌더될 것입니다.

## `mount`를 사용하는 대형 렌더 트리를 위한 제 2의 해결책

`mount`를 사용하면 몇 가지 경우에는 괜찮을 수 있습니다. 그러나 때로는 적합한 방법이 아닙니다. 예를 들어 여러분이 전체 `<App>` 컴포넌트를 렌더하고 있고, <App> 컴포넌트가 자식 컴포넌트와 기타 등등을 포함한 많은 컴포넌트를 포함하는 대형 렌더 트리를 지닌다고 가정해보겠습니다. 많은 자식 컴포넌트가 다양한 라이프사이클 훅을 유발하고, API 요청 같은 것들을 하고 있습니다.

Jest를 사용하고 있다면, Jest의 강력한 모킹 시스템은 이 문제를 해결하는 훌륭한 해결책을 제공합니다. `<NestedRoute>`의 경우에는 간단하게 자식 컴포넌트를 mock 할 수 있습니다. 아래의 mock을 사용할 수 있고, 위 테스트는 여전히 통과합니다.

```js
jest.mock("@/components/NestedRoute.vue", () => ({
  name: "NestedRoute",
  render: h => h("div")
}))
```

## Mock 라우터 사용하기

때로는 실제 라우터가 불필요합니다. 현재 path의 쿼리 스트링(query string)을 바탕으로 username을 보여주도록 `<NestedRoute>`를 업데이트하겠습니다. 이번에는 기능을 구현하기 위해 TDD를 사용하겠습니다. 아래에 간단하게 컴포넌트를 렌더하고 어설션(assertion)을 하는 기본적인 테스트가 있습니다.

```js
import { shallowMount } from "@vue/test-utils"
import NestedRoute from "@/components/NestedRoute.vue"
import routes from "@/routes.js"

describe("NestedRoute", () => {
  it("쿼리 스트링으로부터 username을 렌더한다", () => {
    const username = "alice"
    const wrapper = shallowMount(NestedRoute)

    expect(wrapper.find(".username").text()).toBe(username)
  })
})
```

아직 `<div class="username">`이 없어서, 테스트를 실행하면 아래와 같은 메시지가 나옵니다.

```
FAIL  tests/unit/NestedRoute.spec.js
  NestedRoute
    ✕ renders a username from query string (25ms)

  ● NestedRoute › renders a username from query string

    [vue-test-utils]: find did not return .username, cannot call text() on empty Wrapper
``` 

`<NestedRoute>`를 업데이트하겠습니다.

```vue
<template>
  <div>
    Nested Route
    <div class="username">
      {{ $route.params.username }}
    </div>
  </div>
</template>
```

이제 테스트가 실패하고 아래와 같은 메시지가 나옵니다.

```
FAIL  tests/unit/NestedRoute.spec.js
  NestedRoute
    ✕ renders a username from query string (17ms)

  ● NestedRoute › renders a username from query string

    TypeError: Cannot read property 'params' of undefined
```

`$route`가 존재하지 않기 때문입니다. 실제 라우터를 사용하고 있지만, 이 경우에는 그냥 `mocks` 마운팅 옵션을 사용하는 게 더 쉽습니다.

```js
it("쿼리 스트링으로부터 username을 렌더한다", () => {
  const username = "alice"
  const wrapper = shallowMount(NestedRoute, {
    mocks: {
      $route: {
        params: { username }
      }
    }
  })

  expect(wrapper.find(".username").text()).toBe(username)
})
```

이제 테스트가 통과합니다. 이 경우에 임의의 네비게이션이나 라우터의 구현체에 의존하는 어떤 것도 하고 싶지 않습니다. 그래서 `mocks`를 사용하는 것이 좋습니다. `username`이 쿼리 스트링에서 어떻게 오는지는 별로 신경 쓰지 않습니다. 단지 `username`이 존재할 뿐입니다.

보통은 Vue 라우터로 클라이언트 사이드 렌더링을 하는 것이 아니라, 서버가 라우팅을 제공할 것입니다. 이런 경우에는 테스트에서 쿼리 스트링을 설정하는 `mocks`를 사용하는 것이 Vue 라우터의 실제 인스턴스를 사용하는 좋은 대안입니다.

## 라우터 훅을 테스트하는 전략

Vue 라우터는 ['navigation guards'](https://router.vuejs.org/guide/advanced/navigation-guards.html)라고 불리는 몇 가지 타입의 라우터 훅을 제공합니다. 아래에 두 가지 예시가 있습니다.

1. 전역 가드 ( `router.beforeEach` ). 라우터 인스턴에서 선언.
2. `beforeRouteEnter`같은 컴포넌트 가드. 컴포넌트에서 선언.

이런 훅이 올바르게 작동하는지 확인하는 것은 보통 통합 테스트의 일입니다. 한 라우트에서 또 다른 라우트로 사용자를 이동시키는 일이 필요하기 때문입니다. 하지만 네비게이션 가드에서 호출된 함수가 올바르게 작동하는지 알기 위해 유닛 테스트를 사용할 수 있고, 잠재적인 버그에 대해 빠른 피드백을 얻을 수 있습니다. 여기에 네비게이션 가드로부터 로직을 분리하고, 분리한 로직에 대해 유닛 테스트를 작성하는 몇 가지 전략이 있습니다.

## 전역 가드

`shouldBustCache` 메타 필드를 포함하는 모든 라우트에서 호출하는 `bustCache` 함수를 가진다고 해보겠습니다. 여러분의 라우트는 아래와 같은 모습일 것입니다.

```js
import NestedRoute from "@/components/NestedRoute.vue"

export default [
  {
    path: "/nested-route",
    component: NestedRoute,
    meta: {
      shouldBustCache: true
    }
  }
]
```

사용자가 오래된 데이터를 가지지 않도록, `shouldBustCache` 메타 필드를 사용해서 현재 데이터를 무효화하기를 원합니다. 구현체는 아래와 같습니다.

```js
import Vue from "vue"
import VueRouter from "vue-router"
import routes from "./routes.js"
import { bustCache } from "./bust-cache.js"

Vue.use(VueRouter)

const router = new VueRouter({ routes })

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.shouldBustCache)) {
    bustCache()
  }
  next()
})

export default router
```

여러분의 유닛 테스트에서, 라우터 인스턴스를 추출하거나, `router.beforeHooks[0]()`을 입력해서 `beforeEach`를 호출하려고 시도 __할 수도__ 있습니다. 이 방법은  `next`에 대한 에러를 던집니다. 올바른 인자를 넘기지 않았기 때문입니다. 이 방법 대신에 할 수 있는 한 가지 전략은, 라우터에 연결하기 전에 `beforeEach` 네비게이션 훅을 분리하고 독립적으로 내보내는 것입니다. 아래와 같은 방법입니다.

```js
export function beforeEach(to, from, next) {
  if (to.matched.some(record => record.meta.shouldBustCache)) {
    bustCache()
  }
  next()
}

router.beforeEach((to, from, next) => beforeEach(to, from, next))

export default router
```

약간 길어졌지만, 이제 테스트를 작성하는 일이 쉬워졌습니다.

```js
import { beforeEach } from "@/router.js"
import mockModule from "@/bust-cache.js"

jest.mock("@/bust-cache.js", () => ({ bustCache: jest.fn() }))

describe("beforeEach", () => {
  afterEach(() => {
    mockModule.bustCache.mockClear()
  })

  it("/user로 이동할 때 캐시를 없앤다", () => {
    const to = {
      matched: [{ meta: { shouldBustCache: true } }]
    }
    const next = jest.fn()

    beforeEach(to, undefined, next)

    expect(mockModule.bustCache).toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  it("/user로 이동할 때 캐시를 없애지 않는다", () => {
    const to = {
      matched: [{ meta: { shouldBustCache: false } }]
    }
    const next = jest.fn()

    beforeEach(to, undefined, next)

    expect(mockModule.bustCache).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })
})
```

관심사의 요점은 `jest.mock`을 사용해서 전체 모듈을 mock 하고, `afterEach`훅을 사용해서 mock을 재설정하는 것입니다.  `beforeEach`를 분리하여, 일반 자바스크립트 함수로 내보내면, 테스트가 쉬워집니다.

훅이 실제로 `bustCache`를 호출하고 있고, 가장 최근 데이터를 보여주고 있는 것을 확인하기 위해서, [Cypress.io](https://www.cypress.io/) 같은 e2e 테스팅 툴을 사용할 수 있습니다. 그리고 Cypress.io는 vue-cli를 사용하면 애플리케이션에 포함된 채로 제공됩니다.

## 컴포넌트 가드

일반 자바스크립트 함수로 분리해서 본다면, 컴포넌트 가드도 테스트하기 쉽습니다. `<NestedRoute>`에 `beforeRouteLeave` 훅을 추가해보겠습니다.

```vue
<script>
import { bustCache } from "@/bust-cache.js"
export default {
  name: "NestedRoute",

  beforeRouteLeave(to, from, next) {
    bustCache()
    next()
  }
}
</script>
```

전역 가드와 정확하게 같은 방법으로 테스트할 수 있습니다.

```js
// ...
import NestedRoute from "@/components/NestedRoute.vue"
import mockModule from "@/bust-cache.js"

jest.mock("@/bust-cache.js", () => ({ bustCache: jest.fn() }))

it("라우트를 떠날 때 bustCache와 next를 호출한다", async () => {
  const wrapper = shallowMount(NestedRoute);
  const next = jest.fn()
  NestedRoute.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next)
  await wrapper.vm.$nextTick()


  expect(mockModule.bustCache).toHaveBeenCalled()
  expect(next).toHaveBeenCalled()
})
```

이런 방식의 유닛 테스트가 개발하는 동안 즉각적인 피드백을 받는 데 도움을 줄 수 있습니다. 라우터와 네비게이션 훅이 종종 어떤 효과를 얻기 위해서 몇 가지 컴포넌트와 상호작용하기 때문입니다. 모든 것이 기대한 것처럼 잘 작동하는지 확인하기 위해서 통합 테스트를 할 수도 있습니다.

## 결론

이 가이드는 아래의 내용을 다뤘습니다.

- Vue 라우터에 의해 조건부로 렌더된 컴포넌트 테스트하기
- `jest.mock`과 `localVue`를 사용해서 Vue 컴포넌트 모킹하기
- 라우터로부터 전역 네비게이션 가드를 분리하고 독립적으로 테스트하기
- 모듈을 mock 하기 위해서 `jest.mcok` 사용하기

이 페이지에서 설명한 테스트의 소스 코드는 [여기](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/App.spec.js)와 [여기](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/NestedRoute.spec.js)에서 찾을 수 있습니다.
