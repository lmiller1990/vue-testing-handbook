## Testing Vuex

The next few guides discuss testing Vuex.

## Two Sides of Testing Vuex

Generally components will interact with Vuex by

1. committing a mutation
2. dispatching an action
3. acesss the state via `$store.state` or getters

These tests are to assert that the component behaves correctly based on the current state of the Vuex store. They do not need to know about the implmentation of the mutators, actions or getters.

Any logic performed by the store, such as mutations and getters, can be tested in isolation. Since Vuex stores are comprised of regular JavaScript functions, they are easily unit tested.

The next guide introduces some techniques to test components that use a Vuex store, and ensure they behave correctly based on the store's state. Later guides discuss testing Vuex in isolation.
