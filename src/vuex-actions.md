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

Since we are using Jest, we can easily mock the API call using `jest.mock`. We will use a fake `axios` instead of the real one, which will give us more control over it's behavior.

### Writing the Test

```js
```
