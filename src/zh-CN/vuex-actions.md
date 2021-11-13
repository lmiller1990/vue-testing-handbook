## 测试 actions

单独地测试 actions 是非常容易的。这和单独地测试 mutations 非常之相似 -- 查看 [这里](https://lmiller1990.github.io/vue-testing-handbook/vuex-mutations.html) 查看更多。在组件上下文中测试 actions 的正确性在 [这里](https://lmiller1990.github.io/vue-testing-handbook/vuex-in-components-mutations-and-actions.html) 有所讨论。

本页中描述的测试源码可以在 [这里](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/actions.spec.js) 找到。

## 创建 action

我们会遵循一个通常的 Vuex 模式创建一个 action：

1. 发起一个向 API 的异步请求
2. 对数据进行一些处理（可选）
3. 根据 payload 的结果 commit 一个 mutation

这里有一个 `认证` action，用来将 username 和 password 发送到外部 API 以检查它们是否匹配。然后其认证结果将被用于通过 commit 一个 `SET_AUTHENTICATED` mutation 来更新 state，该 mutation 将认证结果作为 payload。

```js
import axios from "axios"

export default {
  async authenticate({ commit }, { username, password }) {
    const authenticated = await axios.post("/api/authenticate", {
      username, password
    })

    commit("set_authenticated", authenticated)
  }
}
```

action 的测试应该断言：

1. 是否使用了正确的 API 端？
2. payload 是否正确？
3. 根据结果，是否有正确的 mutation 被 commit

让我们进行下去并编写测试，并让报错信息指引我们。

## 编写测试

```js
describe("authenticate", () => {
  it("authenticated a user", async () => {
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

因为 `axios` 是异步的，为保证 Jest 等到测试完成后才执行，我们需要将其声明为 `async` 并在其后 `await` 那个 `actions.authenticate` 的调用。不然的话（译注：即假如不使用 async/await 而仅仅将 3 个 `expect` 断言放入异步函数的 `then()` 中）测试会早于 `expect` 断言完成，并且我们将得到一个常绿的 -- 一个不会失败的测试。

运行以上测试会给我们下面的报错信息：

```
 FAIL  tests/unit/actions.spec.js
  ● authenticate › authenticated a user

    SyntaxError: The string did not match the expected pattern.

      at XMLHttpRequest.open (node_modules/jsdom/lib/jsdom/living/xmlhttprequest.js:482:15)
      at dispatchXhrRequest (node_modules/axios/lib/adapters/xhr.js:45:13)
      at xhrAdapter (node_modules/axios/lib/adapters/xhr.js:12:10)
      at dispatchRequest (node_modules/axios/lib/core/dispatchRequest.js:59:10)
```

这个错误来自 `axios` 的某处。我们发起了一个对 `/api...` 的请求，并且因为我们运行在一个测试环境中，所以并不是真有一个服务器在处理请求，这就导致了错误。我们也没有定义 `url` 或 `body` -- 我们将在解决掉 `axios` 错误后做那些。

因为使用了 Jest，我们可以用 `jest.mock` 容易地 mock 掉 API 调用。我们将用一个 mock 版本的 `axios` 代替真实的，使我们能更多地控制其行为。Jest 提供了 [ES6 Class Mocks](https://jestjs.io/docs/en/es6-class-mocks)，非常适于 mock `axios`。

`axios` 的 mock 看起来是这样的：

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

我们将 `url` 和 `body` 保存到了变量中以便断言正确的时间端点接收了正确的 payload。因为我们不想实现真正的端点，用一个理解 resolve 的 promise 模拟一次成功的 API 调用就够了。

`yarn test:unit` 现在测试通过了！

## 测试 API Error

咱仅仅测试过了 API 调用成功的情况，而测试所有产出的可能情况也是重要的。让我们编写一个测试应对发生错误的情况。这次，我们将先编写测试，再补全实现。

测试可以写成这样：

```js
it("catches an error", async () => {
  mockError = true

  await expect(actions.authenticate({ commit: jest.fn() }, {}))
    .rejects.toThrow("API Error occurred.")
})
```

我们要找到一种强制 `axios` mock 抛出错误的方法。正如 `mockError` 变量代表的那样。将 `axios` mock 更新为：

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

只有当一个 ES6 类 mock 作用域外的（out-of-scope）变量以 `mock` 为前缀时，Jest 才允许访问它（译注：查看[文档](https://jestjs.io/docs/en/es6-class-mocks#calling-jestmockdocsenjest-objectjestmockmodulename-factory-options-with-the-module-factory-parameter)）。现在我们简单地赋值 `mockError = true` 然后 `axios` 就会抛出错误了。

运行该测试给我们这些报错：

```
FAIL  tests/unit/actions.spec.js
● authenticate › catchs an error

  expect(function).toThrow(string)

  Expected the function to throw an error matching:
    "API Error occurred."
  Instead, it threw:
    Mock error
```

成功的抛出了一个错误... 却并非我们期望的那个。更新 `authenticate` 以达到目的：

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

现在测试通过了。

## 改良

现在你知道如何单独地测试 actions 了。至少还有一项潜在的改进可以为之，那就是将 `axios` mock 实现为一个 [manual mock](https://jestjs.io/docs/en/manual-mocks)。这包含在 `node_modules` 的同级创建一个 `__mocks__` 目录并在其中实现 mock 模块。Jest 将自动使用  `__mocks__` 中的 mock 实现。在 Jest 站点和因特网上有大量如何做的例子。将本文中的测试重构为一个 manual mock 就留给读者作为练习吧。

## 总结

本文讨论了：

- 使用 Jest ES6 class mocks
- 测试一个 action 成功和失败的情况

本页中描述的测试源码可以在 [这里](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/actions.spec.js) 找到。
