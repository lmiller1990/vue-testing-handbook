## 액션 테스트하기

액션(actions)을 독립적으로 테스트 하는 일은 매우 간단합니다. 뮤테이션(mutations)을 독립적으로 테스트 하는 방법과 비슷합니다. 뮤테이션 테스트에 대해 좀 더 자세히 알기를 원한다면 [여기](https://lmiller1990.github.io/vue-testing-handbook/vuex-mutations.html)에서 보세요. 컴포넌트의 맥락에서 액션을 올바르게 디스패치(dispatch) 하는 테스트 작업은 [여기](https://lmiller1990.github.io/vue-testing-handbook/vuex-in-components-mutations-and-actions.html)에서 다룹니다.

이 페이지에서 설명한 테스트의 소스 코드는 [여기](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/actions.spec.js)에서 찾을 수 있습니다.

## 액션 생성하기

일반적인 Vuex 패턴을 따르는 액션을 작성해 보겠습니다.

1. API에 비동기 호출 하기
2. 데이터에 약간의 처리과정 거치기 (선택)
3. 페이로드의 결과로 뮤테이션 커밋하기

username과 password를 외부 API에 보내서 일치하는지 확인하는 `authenticate` 액션이 있습니다. 그런 다음 결과를 페이로드(payload)로 보내고 `SET_AUTHENTICATED` 뮤테이션을 커밋(commit)해서 상태(state)를 업데이트 하는데 사용합니다.

```js
import axios from "axios"

export default {
  async authenticate({ commit }, { username, password }) {
    const authenticated = await axios.post("/api/authenticate", {
      username, password
    })

    commit("SET_AUTHENTICATED", authenticated)
  }
}
```

위의 액션 테스트는 아래의 내용을 어설트(assert) 해야 합니다.

1. 사용한 API의 엔드포인트가 정확했는지?
2. 페이로드가 정확한지?
3. 결과적으로 올바른 뮤테이션을 커밋했는지

더 나아가서 테스트를 작성하고, 실패 메세지가 우리를 이끌어주도록 하겠습니다.

## 테스트 작성하기

```js
describe("authenticate", () => {
  it("인증된 유저", async () => {
    const commit = jest.fn()
    const username = "alice"
    const password = "password"

    await actions.authenticate({ commit }, { username, password })

    expect(url).toBe("/api/authenticate")
    expect(body).toEqual({ username, password })
    expect(commit).toHaveBeenCalledWith(
      "SET_AUTHENTICATED", true)
  })
})
```

`axios`가 비동기이기 때문에, Jest가 테스트가 끝날 때까지 기다리는지 확인하기 위해서, 테스트 앞에는 `async`를, `actions.authenticate` 호출부에는 `await`을 선언해야 합니다. 그렇지 않으면 테스트는 `expect` 어설션 전에 끝나고, 에버그린(evergreen) 테스트를 가지게 될 것입니다. (절대 실패할 수 없는 테스트를 의미합니다)

위 테스트를 실행시켜보면, 아래와 같은 실패 메세지를 받게 됩니다.

```
 FAIL  tests/unit/actions.spec.js
  ● authenticate › authenticated a user

    SyntaxError: The string did not match the expected pattern.

      at XMLHttpRequest.open (node_modules/jsdom/lib/jsdom/living/xmlhttprequest.js:482:15)
      at dispatchXhrRequest (node_modules/axios/lib/adapters/xhr.js:45:13)
      at xhrAdapter (node_modules/axios/lib/adapters/xhr.js:12:10)
      at dispatchRequest (node_modules/axios/lib/core/dispatchRequest.js:59:10)
```

이 에러는 `axios` 내에 어디서든지 나오게됩니다. `/api...`에 요청을 하고 있고, 테스트 환경에서 실행할 뿐만 아니라, 요청이나 에러를 발생시키는 서버도 없기 때문입니다. `url`이나 `body`도 정의되지 않았습니다. (`axios` 에러를 resolve 하는 동안에 url이나 body를 정의하는 일을 하겠습니다)

Jest를 사용하고 있기 때문에, `jest.mock`을 사용해서 API 호출을 쉽게 mock 할 수 있습니다. 진짜 axios 대신에 mock `axios`를 사용하겠습니다. mock axios는 좀더 API의 동작을 통제할 수 있도록 해줄 것입니다. Jest는 [ES6 Class Mocks](https://jestjs.io/docs/en/es6-class-mocks)을 제공하는데, `axios`를 모킹(mocking) 하는데 완벽히 최적화 돼있습니다.

`axios` mock은 아래와 같은 모습입니다.

```js
let url = ''
let body = {}

jest.mock("axios", () => ({
  post: (_url, _body) => { 
    return new Promise((resolve) => {
      url = _url
      body = _body
      resolve(true)
    })
  }
}))
```

변수에 `url`과 `body`를 저장하고 올바른 엔드포인트가 올바른 페이로드를 받고있는지 어설트 할 수 있습니다. 실제로 진짜 엔드포인트를 건드리기를 원하지는 않기 때문에, promise를 즉시 resolve 하고 성공적인 API 호출을 시연 할 수 있습니다.

`yarn unit:pass`는 이제 통과하는 테스트를 산출합니다!

## API 에러 테스트하기

여태까지는 API 호출이 성공한 경우만 테스트 했습니다. 가능한 모든 결과를 테스트 하는 일은 중요합니다. 에러가 일어나는 경우의 테스트를 작성해보겠습니다. 이번에는 테스트를 먼저 작성하고나서 시행하겠습니다.

테스트는 아래와 같은 모습으로 작성할 수 있습니다.

```js
it("에러를 캐치한다", async () => {
  mockError = true

  await expect(actions.authenticate({ commit: jest.fn() }, {}))
    .rejects.toThrow("API 에러가 발생했다")
})
```

강제로 `axios` mock이 에러를 던지도록 하는 방법을 찾아야 합니다. `mockError` 변수가 적격입니다. `axios` mock을 아래와 같이 업데이트하겠습니다.

```js
let url = ''
let body = {}
let mockError = false

jest.mock("axios", () => ({
  post: (_url, _body) => { 
    return new Promise((resolve) => {
      if (mockError) 
        throw Error()

      url = _url
      body = _body
      resolve(true)
    })
  }
}))
```

Jest는 변수의 이름이 `mock`에 붙는 경우만, ES6 클래스(class) mock에서 스코프 밖의 변수에 접근하는 것을 허락합니다. 이제 간단하게 `mockError = true`로 바꿀 수 있고, `axios`는 에러를 던질 것입니다.

이 테스트를 실행하면 아래와 같은 실패하는 에러를 줍니다.

```
FAIL  tests/unit/actions.spec.js
● authenticate › catchs an error

  expect(function).toThrow(string)

  Expected the function to throw an error matching:
    "API Error occurred."
  Instead, it threw:
    Mock error
```

성공적으로 에러를 잡았습니다만... 예상한 결과가 아닙니다. 테스트에서 예상되는 에러를 던지도록 하기 위해 `authenticate`를 업데이트 하겠습니다.

```js
export default {
  async authenticate({ commit }, { username, password }) {
    try {
      const authenticated = await axios.post("/api/authenticate", {
        username, password
      })

      commit("SET_AUTHENTICATED", authenticated)
    } catch (e) {
      throw Error("API Error occurred.")
    }
  }
}
```

이제 테스트가 통과합니다.

## 개선사항

이제 액션을 어떻게 독립적으로 테스트 하는지 알게 되었습니다. 적어도 한 가지 잠재적으로 개선할 수 있는 부분이 남아있는데, `axios` mock을 [manual mock](https://jestjs.io/docs/en/manual-mocks)으로 구현하는 것입니다. 여기에는 `node_modules`와 동일한 수준에서 `__mocks__` 디렉토리를 생성하고 그 곳에서 mock 모듈을 구현하는 작업이 포함됩니다. 이렇게 하면 여러분은 mock 구현체를 테스트 전역에서 공유할 수 있습니다. Jest는 자동으로 `__mocks__` mock 구현체를 사용할 것입니다. Jest 웹사이트와 인터넷에 구현 방법에 대한 많은 예제가 있습니다. manual mock을 사용하도록 이 테스트를 리팩토링 하는 것이 독자 여러분에게 남겨진 과제입니다.

## 결론

이 가이드는 아래의 내용을 다뤘습니다.

- Jest ES6 class mocks 사용
- 액션의 성공 사례와 실패 사례 테스트

이 페이지에서 설명한 테스트의 소스 코드는 [여기](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/actions.spec.js)에서 찾을 수 있습니다.
