### Testing Actions

Testing actions in isolation is very straight forward. It is very similar to testing mutations in isolations see [here](https://lmiller1990.github.io/vue-testing-handbook/vuex-mutations.html) for more details. Testing actions in the context of a component is discussed [here](https://lmiller1990.github.io/vue-testing-handbook/vuex-in-components-mutations-and-actions.html).

### Creating the Action

We will write a action that follows a common Vuex pattern:

1. make an asynchronous call to an API
2. do some proccessing on the data (optional)
3. commit a mutation with the result as the payload

This is an `authenticate` action, which send a username and password to an external API to check if the pair is a match. The result of the API response is then commited to using a `SET_AUTHENTICATED` mutation.

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

The action test should assert:

1. was the correct API endpoint used?
2. is the payload correct?
3. was the correct mutation committed with the result

Let's go ahead and write the test, and let the failure messages guide us to a passing test.

### Writing the Test

```js
describe("authenticate", () => {
  it("authenticated a user", async () => {
    const commit = jest.fn()
    const username = "alice"
    const password = "password"

    await actions.authenticate({ commit }, { username, password })

    expect(url).toBe("/api/authenticate")
    expect(commit).toHaveBeenCalledWith(
      "SET_AUTHENTICATED", { username, password })
  })
})
```

Running this test gives us the following failure message:

```
 FAIL  tests/unit/actions.spec.js
  ● authenticate › authenticated a user

    SyntaxError: The string did not match the expected pattern.

      at XMLHttpRequest.open (node_modules/jsdom/lib/jsdom/living/xmlhttprequest.js:482:15)
      at dispatchXhrRequest (node_modules/axios/lib/adapters/xhr.js:45:13)
      at xhrAdapter (node_modules/axios/lib/adapters/xhr.js:12:10)
      at dispatchRequest (node_modules/axios/lib/core/dispatchRequest.js:59:10)
```

This error is coming somewhere from within `axios`. We are making a request to `/api...`, and in the case of the test runner, there isn't even a server to make a request to.

Since we are using Jest, we can easily mock the API call using `jest.mock`. We will use a fake `axios` instead of the real one, which will give us more control over it's behavior.

