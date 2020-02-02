## 컴포지션 API

Vue 3는 컴포넌트를 생성하는 새로운 API를 소개합니다. 바로 [Composition API](https://vue-composition-api-rfc.netlify.com/#basic-example) 입니다. 사용자가 새로운 API를 사용하고  피드백을 줄 수 있도록, Vue 팀은 Vue 2에서 사용해볼 수 있는 플러그인을 배포했습니다. 그 내용은 [여기](https://github.com/vuejs/composition-api)에서 찾을 수 있습니다.

컴포지션 API로 만든 컴포넌트를 테스트하는 일은 기존 컴포넌트 테스트와 다르지 않습니다. 구현체가 아닌 결과를 테스트하기 때문입니다. (컴포넌트가 어떤 일을 *어떻게* 하는지가 아니라, *어떤 것*을 하는지를 의미합니다) 이 글은 Vue 2에서 컴포지션 API를 사용한 컴포넌트의 간단한 예와 테스트 전략이, 다른 컴포넌트와 어떻게 동일한지 보여줍니다.

이 페이지에서 설명한 테스트의 소스 코드는 [여기](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/CompositionApi.spec.js)서 찾을 수 있습니다.

## 컴포넌트

컴포지션 API에서의 "Hello, World"는 대략 아래와 같습니다. 좀 더 컴포지션 API에 대해 이해하고 싶다면, [RFC를 읽어보거나](https://vue-composition-api-rfc.netlify.com/) 구글에 검색해보세요. 컴포지션 API에 대한 많은 자료가 있습니다.

```html
<template>
  <div>
    <div class="message">{{ uppercasedMessage }}</div>
    <div class="count">
      Count: {{ state.count }}
    </div>
    <button @click="increment">Increment</button>
  </div>
</template>

<script>
import Vue from 'vue'
import VueCompositionApi from '@vue/composition-api'

Vue.use(VueCompositionApi)

import { 
  reactive,
  computed
} from '@vue/composition-api'

export default {
  name: 'CompositionApi',

  props: {
    message: {
      type: String
    }
  },

  setup(props) {
    const state = reactive({
      count: 0
    })

    const increment = () => {
      state.count += 1
    }

    return {
      state,
      increment,
      uppercasedMessage: computed(() => props.message.toUpperCase())
    }
  }
}
</script>
```

여기서 테스트해야 할 두 가지 사항은 아래와 같습니다.

1. increment 버튼을 클릭하면 `state.count`가 1씩 증가하는지?

2. props에서 받은 메세지를 올바르게 렌더하는지 (대문자로 변한되는지)?

## props 메시지 테스트

메시지를 올바르게 렌더하는지 테스트하는 일은 간단합니다. 그냥 [여기](https://lmiller1990.github.io/vue-testing-handbook/components-with-props.html)에서 설명한 것처럼 prop의 값(value)를 설정하기 위해 `propsData`를 사용하면 됩니다.

```js
import { shallowMount } from "@vue/test-utils"

import CompositionApi from "@/components/CompositionApi.vue"

describe("CompositionApi", () => {
  it("메시지를 렌더한다", () => {
    const wrapper = shallowMount(CompositionApi, {
      propsData: {
        message: "Testing the composition API"
      }
    })

    expect(wrapper.find(".message").text()).toBe("TESTING THE COMPOSITION API")
  })
})
```

예상했던 것처럼 매우 간단합니다. 컴포넌트를 구성하고 있는 방법과 무관하게, 같은 API와 전략을 사용해서 테스트합니다. 테스트를 건드릴 필요 없이, 전체 구현체를 바꿀 수 있습니다. 주어진 입력값(props, 트리거된 이벤트)를 바탕으로, 결과(보통 렌더된 HTML)을 테스트 해야 한다는 것을 기억해주세요. 구현체를 테스트하는 게 아닙니다.

## 버튼 클릭 테스트하기

버튼을 클릭하면 `state.count`가 증가하는지 확인하기 위한 테스트를 작성하는 일도 똑같이 간단합니다. 테스트가 `async` 상태로 표시된 것을 봐주세요. [사용자 입력 시연하기](https://lmiller1990.github.io/vue-testing-handbook/simulating-user-input.html#writing-the-test)에서 이 작업이 필요한 이유에 대해서 자세히 읽어보세요.

```js
import { shallowMount } from "@vue/test-utils"

import CompositionApi from "@/components/CompositionApi.vue"

describe("CompositionApi", () => {
  it("버튼을 클릭하면 카운트가 증가한다", async () => {
    const wrapper = shallowMount(CompositionApi, {
      propsData: { message: '' }
    })

    wrapper.find('button').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find(".count").text()).toBe("Count: 1")
  })
})
```

다시 말하자면, 전체적으로 크게 다르지 않습니다. 클릭 이벤트를  `trigger` 하고 렌더된 `count`가 증가했는지 어설트(assert) 합니다.

## 결론

이 글은 컴포지션 API를 사용한 컴포넌트를 테스트하는 방법이, 기존 API을 사용한 컴포넌트를 테스트하는 일과 동일함을 입증합니다. 발상과 개념은 같습니다. 배워야 할 요점은 테스트를 작성할 때 입력과 출력을 바탕으로 어설션 하는 것입니다.

유닛 테스트를 바꿀 필요 없이 기존 Vue 컴포넌트를 컴포지션 API를 사용해서 리팩토링 할 수 있습니다. 리팩토링할 때, 스스로 테스트를 바꿀 필요성을 느낀다면 아마 결과가 아니라 *구현체*를 테스트하고 있어서 그럴 겁니다.

컴포지션 API는 전적으로 조미료와 같습니다. 그래서 당장 사용할 필요는 없습니다. 하지만 여러분의 선택과 무관하게, 좋은 유닛 테스트는, 구현체의 세부사항을 고려하지 않고 컴포넌트의 최종 상태(state)를 어설트 한다는 점을 기억해주세요.
