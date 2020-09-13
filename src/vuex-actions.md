## Testing Actions

Testing actions in isolation is very straight forward. It is very similar to testing mutations in isolation - see [here](https://lmiller1990.github.io/vue-testing-handbook/vuex-mutations.html) for more on mutation testing. Testing that a component is correctly dispatching actions is discussed [here](https://lmiller1990.github.io/vue-testing-handbook/vuex-in-components-mutations-and-actions.html).

The source code for the test described on this page can be found [here](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/actions.spec.js).

## Creating the Action

We will write an action that follows a common Vuex pattern:

1. make an asynchronous call to an API
2. do some proccessing on the data (optional)
3. commit a mutation with the result as the payload

This is an `authenticate` action, which sends a username and password to an external API to check if they are a match. The result is then used to update the state by committing a `SET_AUTHENTICATED` mutation with the result as the payload.

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

The action test should assert:

1. was the correct API endpoint used?
2. is the payload correct?
3. was the correct mutation committed with the result

Let's go ahead and write the test, and let the failure messages guide us.

## Writing the Test

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

Since `axios` is asynchronous, to ensure Jest waits for test to finish we need to declare it as `async` and then `await` the call to `actions.authenticate`. Otherwise the test will finish before the `expect` assertion, and we will have an evergreen test - a test that can never fail.

Running the above test gives us the following failure message:

```
 FAIL  tests/unit/actions.spec.js
  ● authenticate › authenticated a user

    SyntaxError: The string did not match the expected pattern.

      at XMLHttpRequest.open (node_modules/jsdom/lib/jsdom/living/xmlhttprequest.js:482:15)
      at dispatchXhrRequest (node_modules/axios/lib/adapters/xhr.js:45:13)
      at xhrAdapter (node_modules/axios/lib/adapters/xhr.js:12:10)
      at dispatchRequest (node_modules/axios/lib/core/dispatchRequest.js:59:10)
```

This error is coming somewhere from within `axios`. We are making a request to `/api...`, and since we are running in a test environment, there isn't even a server to make a request to, thus the error. We also did not defined `url` or `body` - we will do that while we solve the `axios` error.

Since we are using Jest, we can easily mock the API call using `jest.mock`. We will use a mock `axios` instead of the real one, which will give us more control over its behavior. Jest provides [ES6 Class Mocks](https://jestjs.io/docs/en/es6-class-mocks), which are a perfect fit for mocking `axios`.

The `axios` mock looks like this:

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

We save `url` and `body` to variables to we can assert the correct endpoint is receiving the correct payload. Since we don't actually want to hit a real endpoint, we resolve the promise immediately which simulates a successful API call.

`yarn unit:pass` now yields a passing test!

## Testing for the API Error

We only tested the case where the API call succeed. It's important to test all the possible outcomes. Let's write a test for the case where an error occurs. This time, we will write the test first, followed by the implementation.

The test can be written like this:

```js
it("catches an error", async () => {
  mockError = true

  await expect(actions.authenticate({ commit: jest.fn() }, {}))
    .rejects.toThrow("API Error occurred.")
})
```

We need to find a way to force the `axios` mock to throw an error. That's what the `mockError` variable is for. Update the `axios` mock like this:

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

Jest will only allow accessing an out of scope variable in an ES6 class mock if the variable name is prepended with `mock`. Now we can simply do `mockError = true` and `axios` will throw an error.

Running this test gives us this failing error:

```
FAIL  tests/unit/actions.spec.js
● authenticate › catchs an error

  expect(function).toThrow(string)

  Expected the function to throw an error matching:
    "API Error occurred."
  Instead, it threw:
    Mock error
```

It successfully caught the an error... but not the one we expected. Update `authenticate` to throw the error the test is expecting:

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

Now the test is passing.

## Improvements

Now you know how to test actions in isolation. There is at least one potential improvement that can be made, which is to implement the `axios` mock as a [manual mock](https://jestjs.io/docs/en/manual-mocks). This involves creating a `__mocks__` directory on the same level as `node_modules` and implementing the mock module there. By doing this, you can share the mock implementation across all your tests. Jest will automatically use a `__mocks__` mock implementation. There are plenty of examples on the Jest website and around the internet on how to do so. Refactoring this test to use a manual mock is left as an exercise to the reader.

## Conclusion

This guide discussed:

- using Jest ES6 class mocks
- testing both the success and failure cases of an action

The source code for the test described on this page can be found [here](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/actions.spec.js).
