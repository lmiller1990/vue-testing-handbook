## 엘리먼트 찾기

`vue-test-utils`는 `find` 메서드를 사용해서 html 엘리먼트나 다른 Vue 컴포넌트의 존재를 발견하고 어설트(assert) 하는 여러 가지 방법을 제공합니다. `find`의 주 사용법은 컴포넌트가 엘리먼트나 자식 컴포넌트를 제대로 렌더했는지 어설트하는 것입니다.

이 페이지에서 설명한 테스트의 소스 코드는 [여기](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/Parent.spec.js)에서 찾을 수 있습니다.

## 컴포넌트 생성하기

이번 예제를 위해서 `<Child>`와 `<Parent>` 컴포넌트를 만들겠습니다.

Child 컴포넌트는 아래와 같습니다.

```vue
<template>
  <div>Child</div>
</template>

<script>
export default {
  name: "Child"
}
</script>
```

Parent 컴포넌트는 아래와 같습니다.

```vue
<template>
  <div>
    <span v-show="showSpan">
      Parent Component
    </span>
    <Child v-if="showChild" />
  </div>
</template>

<script>
import Child from "./Child.vue"

export default {
  name: "Parent",

  components: { Child },

  data() {
    return {
      showSpan: false,
      showChild: false
    }
  }
}
</script>
```

## `querySelector` 문법과 `find`

`document.querySelector`와 함께 사용하는 문법을 사용하면 정규 엘리먼트는 쉽게 선택할 수 있습니다. `vue-test-utils`는 조건부로 `v-show`를 사용해 렌더한 엘리먼트가 보이는지 안보이는지를 확인하는 `isVisible` 메서드도 제공합니다. `Parent.spec.js`를 생성하고 내부에 아래와 같은 테스트를 추가하겠습니다.

```js
import { mount, shallowMount } from "@vue/test-utils"
import Parent from "@/components/Parent.vue"

describe("Parent", () => {
  it("span 태그를 렌더하지 않는다", () => {
    const wrapper = shallowMount(Parent)

    expect(wrapper.find("span").isVisible()).toBe(false)
  })
})
```

`v-show="showSpan"`은 `false`가 기본설정이기 때문에, 발견한 `<span>` 엘리먼트의 `isVisible` 메서드는 `false`를 리턴한다는 것을 예상할 수 있습니다.  `yarn test:unit`을 실행하면 테스트는 통과합니다. 다음은 `showSpan`이 `true`일 때의 테스트 케이스입니다.

```js
it("span 태그를 렌더한다", () => {
  const wrapper = shallowMount(Parent, {
    data() {
      return { showSpan: true }
    }
  })

  expect(wrapper.find("span").isVisible()).toBe(true)
})
```

이 테스트는 통과합니다! `v-show`를 위한 `isVisible`처럼, `vue-test-utils`는  `v-if`를 사용해서 조건부로 렌더하는 엘리먼트를 테스트할 때 사용하는 `exists` 메서드를 제공합니다.

## `name`과 `Component`로 컴포넌트 찾기

자식 컴포넌트를 발견하는 일은 정규 HTML 엘리먼트를 찾는 것과 약간 다릅니다. 자식 Vue 컴포넌트의 존재를 어설트하는 두 가지의 주요한 방법이 있습니다.

1. `find(Component)`
2. `find({ name: "ComponentName" })`

예제 테스트의 문맥을 보면 약간 더 이해하기 쉽습니다. `find(Component)` 문법으로 테스트를 시작해보겠습니다. 이 방법은 컴포넌트를 `import` 하고 import한 컴포넌트를 `find` 함수에 넘겨줘야 합니다.

```js
import Child from "@/components/Child.vue"

it("자식 컴포넌트를 렌더하지 않는다", () => {
  const wrapper = shallowMount(Parent)

  expect(wrapper.find(Child).exists()).toBe(false)
})
```

`find`를 위한 구현체는 꽤 복잡합니다. `querySelector` 문법뿐만 아니라 몇 가지 다른 문법과 함께 작동하기 때문입니다. 자식 Vue 컴포넌트를 찾는 소스 일부를 [여기](https://github.com/vuejs/vue-test-utils/blob/dev/packages/test-utils/src/find.js)에서 볼 수 있습니다. 기본적으로 렌더한 각각의 자식을 대조해서 컴포넌트의 `name`을 확인하고 나서 `constructor`와 몇 가지 다른 프로퍼티를 확인합니다.

이전 단락에서 언급했던 것처럼, `name` 프로퍼티는 컴포넌트를 넘겼을 때 `find`로 확인하는 방법 중 하나입니다. 컴포넌트를 넘겨주는 대신, 간단하게 올바른 `name` 프로퍼티를 가진 객체를 넘겨줄 수도 있습니다. 이 방법은 컴포넌트를 `import` 할 필요가 없음을 의미합니다. `<Child>`를 렌더하는 경우를 테스트해보겠습니다.

```js
it("자식 컴포넌트를 렌더한다", () => {
  const wrapper = shallowMount(Parent, {
    data() {
      return { showChild: true }
    }
  })

  expect(wrapper.find({ name: "Child" }).exists()).toBe(true)
})
```

테스트가 통과합니다! `name` 프로퍼티를 사용하면 약간 직관적이지 않을 수는 있습니다. 그래서 대안으로 실제로 컴포넌트를 추출하는 방법을 사용합니다. 또 다른 옵션은 처음 두 가지 예제에서 보여준 `querySelector` 스타일 문법을 사용해서 간단하게 `class`나 `id`를 추가하고 쿼리(query)를 추가하는 것입니다.

## `findAll`

종종 여러 엘리먼트가 렌더됐는지 어설트 하기를 원하는 경우가 있을 수 있습니다. 일반적인 경우는 `v-for`로 렌더한 아이템의 리스트입니다. 아래에 몇 가지 `<Child>` 컴포넌트를 렌더한 `<ParentWithManyChildren>` 컴포넌트가 있습니다.

```js
<template>
  <div>
    <Child v-for="id in [1, 2 ,3]" :key="id" />
  </div>
</template>

<script>
import Child from "./Child.vue"

export default {
  name: "ParentWithManyChildren",

  components: { Child }
}
</script>
```

아래와 같이 3개의 `<Child>` 컴포넌트가 렌더됐는지 어설트하기 위해서 `findAll`을 사용해서 테스트를 작성할 수 있습니다.

```js
it("다수의 자식을 렌더한다", () => {
  const wrapper = shallowMount(ParentWithManyChildren)

  expect(wrapper.findAll(Child).length).toBe(3)
})
```

`yarn test:unit`을 실행하면 테스트가 통과하는 모습을 보여줍니다. 마찬가지로 `findAll`과 함께 `querySelector`를 사용할 수 있습니다.

## 결론

이 페이지는 아래의 내용을 다룹니다.

- `querySelector` 문법과 함께 `find`와 `findAll` 사용하기
- `isVisible`과 `exists`
- 셀렉터로 컴포넌트 또는 name과 함께 `find`와 `findAll` 사용하기

이 페이지에서 설명한 테스트의 소스 코드는 [여기](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/Parent.spec.js)에서 찾을 수 있습니다.
