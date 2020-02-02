## 게터 테스트하기

게터(getters)를 독립적으로 테스트 하는 일은 간단합니다. 게터가 기본적으로 자바스크립트 함수이기 때문입니다. 이 테크닉은 뮤테이션(mutations)나 액션(actions)를 테스트하는 것과 비슷합니다. 뮤테이션에 대한 더 자세한 정보는 [여기](https://lmiller1990.github.io/vue-testing-handbook/vuex-mutations.html)에 있습니다.

이 페이지에서 설명한 테스트의 소스 코드는 [여기](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/getters.spec.js)에서 찾을 수 있습니다.

두 개의 게터를 보겠습니다. 아래와 같이 스토어(store)에서 작동합니다.

```js
const state = {
  dogs: [
    { name: "lucky", breed: "poodle", age: 1 },
    { name: "pochy", breed: "dalmatian", age: 2 },
    { name: "blackie", breed: "poodle", age: 4 }
  ]
}
```

테스트 할 게터는 아래와 같습니다.

1. `poodles`: 모든 `poodles`를 가집니다
2. `poodlesByAge`: 모든 poodles를 가지고 age 인자를 받습니다.

## 게터 생성하기

먼저 게터를 생성하겠습니다.

```js
export default {
  poodles: (state) => {
    return state.dogs.filter(dog => dog.breed === "poodle")
  },

  poodlesByAge: (state, getters) => (age) => {
    return getters.poodles.filter(dog => dog.age === age)
  }
}
```

별로 흥미롭지는 않습니다. 게터는 두 번째 인자로 다른 게터를 받는다는 사실을 기억하세요. 이미 `poodles` 게터가 있기 때문에, `poodlesByAge`에서 사용할 수 있습니다. 인자를 받는  `poodlesByAge`에서 함수를 리턴함으로써, 게터에 인자를 넘길 수 있습니다. `poodlesByAge` 게터는 아래와 같이 사용할 수 있습니다.

```js
computed: {
  puppies() {
    return this.$store.getters.poodlesByAge(1)
  }
}
```

`poodles`를 테스트 해보겠습니다.

## 테스트 작성하기

게터가 첫 번째 인자로 `상태(state)` 객체를 가지는 일반 자바스크립트 함수이기 때문에, 테스트가 매우 간단합니다. `getters.spec.js` 파일에서 아래와 같은 코드의 테스트를 작성해보겠습니다.

```js
import getters from "../../src/store/getters.js"

const dogs = [
  { name: "lucky", breed: "poodle", age: 1 },
  { name: "pochy", breed: "dalmatian", age: 2 },
  { name: "blackie", breed: "poodle", age: 4 }
]
const state = { dogs }

describe("poodles", () => {
  it("poodles를 반환한다", () => {
    const actual = getters.poodles(state)

    expect(actual).toEqual([ dogs[0], dogs[2] ])
  })
})
```

Vuex는 자동으로 게터에 `상태`를 넘깁니다. 게터를 독립적으로 테스트하고 있기 때문에, 수동으로 `상태`를 넘겨야만 합니다. 그거말고는 일반적인 자바스크립트를 테스트 하는 것과 같습니다.

`poodlesByAge`는 좀 더 흥미롭습니다. 게터의 두 번째 인자는 다른 `게터` 입니다. `poodlesByAge`를 테스트하고 있기에, `poodles`의 구현체가 연관되기를 원하지 않습니다. 대신해서 `getters.poodles`를 스텁(stub) 할 수 있습니다. 이렇게 함으로써 테스트를 좀 더 매끄럽게 통제할 수 있도록 해줄 것입니다.

```js
describe("poodlesByAge", () => {
  it("age에 따라 poodles를 반환한다", () => {
    const poodles = [ dogs[0], dogs[2] ]
    const actual = getters.poodlesByAge(state, { poodles })(1)

    expect(actual).toEqual([ dogs[0] ])
  })
})
```

실제로 진짜 `poodles` 게터를 넘기는 대신에, poodles 게터를 리턴한 결과를 넘깁니다. 게터를 위한 테스트를 작성했기 때문에, poodles 게터가 작동한다는 것을 이미 알고있습니다. 이렇게 함으로써  `poodlesByAge`만의 로직을 집중해서 테스트 할 수 있도록 해줍니다.

`async` 게터를 가지는 것도 가능합니다. `async` 액션처럼 같은 테크닉을 이용해서 테스트할 수 있습니다. 이 부분에 대해서는 [여기](https://lmiller1990.github.io/vue-testing-handbook/vuex-actions.html)에서 읽을 수 있습니다.

## 결론

- `게터`는 그저 일반 자바스크립트 함수입니다.
- `게터`를 별개로 테스트할 때, 상태를 수동으로 넘겨야 합니다.
- 게터가 또 다른 게터를 사용한다면 처음 게터의 예상 반환 결과를 스텁 해야 합니다. 이렇게 하면 테스트를 좀 더 매끄럽게 통제할 수 있고, 문제가 되고 있는 게터를 테스트하는데 집중할 수 있도록 해줍니다.

이 페이지에서 설명한 테스트의 소스 코드는 [여기](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/getters.spec.js)에서 찾을 수 있습니다.
