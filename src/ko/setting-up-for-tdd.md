## vue-cli 설치하기

`vue-test-utils`는 Vue의 공식 테스트 라이브러리이고, 이 가이드를 진행하는 동안 사용할 것입니다. 이 라이브러리는 브라우저와 Node.js 환경 양쪽에서 모두 작동합니다. 그리고 다른 테스트 러너(test runner)와 함께 사용할 수 있습니다. 이 가이드에서는 Node.js 환경에서 테스트를 실행하겠습니다.

`vue-cli`는 가장 간단하게 시작할 수 있는 방법입니다. 프로젝트를 준비해줄 뿐만 아니라 인기있는 테스트 프레임워크인 Jest의 환경도 설정해줍니다. 아래의 커맨드를 통해 설치해보겠습니다.

```sh
yarn global add @vue/cli
```

또는 npm에서 아래와 같이 입력합니다.

```sh
npm install -g @vue/cli
```

`vue create [project-name]`을 실행해서 새로운 프로젝트를 만들어 보겠습니다. "Manually select features"를 선택하고 이어서 "Unit Testing" 선택, 테스트 러너로는 "Jest"를 선택합니다.

설치가 끝나고 나면, `cd`로 프로젝트에 들어가서 `yarn test:unit` 커맨드를 실행합니다. 전부 잘 작동했다면, 아래와 같은 메세지가 나옵니다.

```
 PASS  tests/unit/HelloWorld.spec.js
  HelloWorld.vue
    ✓ renders props.msg when passed (26ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        2.074s
```

축하합니다, 여러분은 첫 번째 통과하는 테스트를 실행했습니다.

## 첫 번째 테스트 작성하기

방금 전에는 프로젝트에 이미 존재하는 테스트를 실행했습니다. 직접 테스트를 작성해 보겠습니다. 컴포넌트를 작성하고, 작성한 컴포넌트를 테스트합니다. 전통적으로 TDD를 할 때, 실패하는 테스트를 먼저 작성하고나서, 테스트를 통과하는 코드를 구현합니다. 지금은 컴포넌트를 먼저 작성하겠습니다.

`src/components/HelloWorld.vue`나 `tests/unit/HelloWorld.spec.js`는 더 이상 필요 없으니까 지워도 됩니다.

## `Greeting` 컴포넌트 생성하기

`src/components` 안에 `Greeting.vue` 파일을 만들어 보겠습니다. `Greeting.vue` 안에 아래와 같은 내용을 추가합니다.

```vue
<template>
  <div>
    {{ greeting }}
  </div>
</template>

<script>
export default {
  name: "Greeting",

  data() {
    return {
      greeting: "Vue and TDD"
    }
  }
}
</script>
```

## 테스트 작성하기

`Greeting`은 `greeting` 값을 렌더(render) 하는 한 가지 책임만 가집니다. 아래와 같은 전략을 가지려고 합니다.

1. `마운트`로 컴포넌트를 렌더합니다.
2. 컴포넌트의 텍스트가 "Vue and TDD"를 포함하는지 어설트 합니다.

`tests/unit` 안에 `Greeting.spec.js`를 생성합니다. `Greeting.vue`와 `mount`를 import 합니다. 그러고 나서 테스트의 개요를 추가합니다.

```
import { mount } from '@vue/test-utils'
import Greeting from '@/components/Greeting.vue'

describe('Greeting.vue', () => {
  it('greeting을 렌더한다', () => {

  })
})
```

TDD에서 사용하는 두 가지 문법이 있습니다. 여기서는 Jest에서 흔히 보이는 `describe`와 `it` 문법을 사용하겠습니다. `describe`는 대부분의 경우에 어떤 것을 테스트할 지에 대한 개요를 나타냅니다. 이 경우에는 `Greeting.vue` 입니다. `it`은 목표하는 테스트를 수행하기 위한 책임 중 한 부분을 나타냅니다. 컴포넌트에 기능을 추가할수록 `it` 블록도 추가됩니다.

이제 `mount`로 컴포넌트를 렌더합니다. 일반적인 방법은 컴포넌트를 `wrapper`라는 변수에 할당하는 것입니다. 올바르게 작동하고 있는지 확인하기 위해서 결과도 출력하겠습니다.

```js
const wrapper = mount(Greeting)

console.log(wrapper.html())
```

## 테스트 실행하기

터미널에서 `tarn test:unit`을 입력해서 테스트를 실행합니다. 파일이 `tests` 폴더에 있고 파일 이름이 `.spec.js`로 끝나면 자동으로 테스트를 수행합니다. 잘 작동했다면, 아래와 같은 메시지를 보게됩니다.

```
PASS  tests/unit/Greeting.spec.js
Greeting.vue
  ✓ renders a greeting (27ms)

console.log tests/unit/Greeting.spec.js:7
  <div>
    Vue and TDD
  </div>
```

마크업이 정확하게 돼있는 것을 볼 수 있고, 테스트는 통과했습니다. 테스트가 실패하지 않았기때문에 통과하고 있습니다. 사실 이 테스트는 절대 실패할 수가 없어서, 유용한 방법은 아닙니다. `Greeting.vue`를 변경하고 템플릿에서 `greeting`을 지워도 여전히 통과합니다. 그럼 한번 수정해보겠습니다.

## 어설션 하기

컴포넌트가 정확하게 작동하는지 확인하기 위해서 어설션(assertion) 하는 게 필요합니다. Jest에서 제공하는 API인 `expect`를 사용해서 어설션 할 수 있습니다. `expect(result).to [matcher] (actual)` 와 같은 형태로 작성합니다.

_Matchers_ 는 값과 객체를 비교하는 메서드입니다. 예를들면 아래와 같습니다.

```js
expect(1).toBe(1)
```

Matchers의 전체 목록은 [Jest 공식문서](https://jestjs.io/docs/en/expect)에서 확인할 수 있습니다. `vue-test-utils`는 어떤 matchers도 포함하지 않습니다. Jest에서 제공하는 것으로 충분합니다. `Greeting`에 있는 텍스트를 비교하고 싶습니다. 아래와 같이 작성합니다.

```js
expect(wrapper.html().includes("Vue and TDD")).toBe(true)
```

그런데 `vue-test-utils`에는 마크업인 `wrapper.text`를 얻는 더 좋은 방법이 있습니다. 테스트의 마지막 부분을 마무리 하겠습니다.

```js
import { mount } from '@vue/test-utils'
import Greeting from '@/components/Greeting.vue'

describe('Greeting.vue', () => {
  it('renders a greeting', () => {
    const wrapper = mount(Greeting)

    expect(wrapper.text()).toMatch("Vue and TDD")
  })
})
```

`console.log`는 더 이상 필요 없습니다. 해당 부분은 삭제해도 됩니다. `yarn test:unit` 명령어를 입력해서 테스트를 실행해보세요. 정상적으로 작동하면 아래와 같은 메세지가 나옵니다.

```
PASS  tests/unit/Greeting.spec.js
Greeting.vue
  ✓ renders a greeting (15ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        1.477s, estimated 2s
```

아주 좋아 보입니다. 그렇지만 정말로 잘 작동하는지 확인하려면, 항상 테스트를 실패하고나서 통과해야합니다. 전통적인 TDD에서는 실제로 기능하는 코드를 작성하기 전에 테스트 코드를 먼저 작성합니다. 테스트 코드의 실패를 보고, 실패 에러를 이용해서 코드를 어떻게 작성해야할지 도움을 받습니다. 이 테스트가 정말로 잘 작동하는지 확인해 보겠습니다. `Greeting.vue`를 아래와 같이 업데이트 해주세요.

```vue
<template>
  <div>
    {{ greeting }}
  </div>
</template>

<script>
export default {
  name: "Greeting",

  data() {
    return {
      greeting: "Vue without TDD"
    }
  }
}
</script>
```

그리고 `yarn test:unit`으로 테스트를 실행해보세요.

```
FAIL  tests/unit/Greeting.spec.js
Greeting.vue
  ✕ renders a greeting (24ms)

● Greeting.vue › renders a greeting

  expect(received).toMatch(expected)

  Expected value to match:
    "Vue and TDD"
  Received:
    "Vue without TDD"

     6 |     const wrapper = mount(Greeting)
     7 |
  >  8 |     expect(wrapper.text()).toMatch("Vue and TDD")
       |                            ^
     9 |   })
    10 | })
    11 |

    at Object.<anonymous> (tests/unit/Greeting.spec.js:8:28)
```

Jest가 좋은 피드백을 줍니다. 예상했던 결과와 실제 결과를 비교해서 볼 수 있습니다. 거기다가 어떤 라인에서 예상했던 테스트가 실패했는지도 볼 수 있습니다. 이 테스트는 예상대로 실패했습니다. `Greeting.vue`를 되돌리고 테스트가 통과하는지 다시 확인해보세요.

다음 챕터에서는 컴포넌트를 렌더링 하기 위해서 `vue-test-utils`에서 제공하는 `mount`와 `shallowMount`라는 두 가지 메서드를 살펴보겠습니다.
