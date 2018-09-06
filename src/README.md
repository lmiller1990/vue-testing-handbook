## What is this guide?

Welcome to the Vue.js testing handbook!

This is a collection of short, focused examples on how to test Vue components. It uses `vue-test-utils`, the official library for testing Vue components, and Jest, a modern testing framework. It covers the `vue-test-utils` API, as well as best practises for testing components.

Each section is independent from the others. We start of by setting up an environment with `vue-cli` and writing a simple test. Next, two ways to render a component are discussed - `mount` and `shallowMount`. The differences will be demonstrated and explained.

From then on, we cover how to test various scenarios that arise when testing components, such as testing components that:

- receive props
- use computed properties
- render other components
- emit events

and so forth. We then move on to more interesting cases, such as:

- best practises for testing Vuex (in components, and independently)
- testing Vue router
- testing involving third party components

We wil also explore how to use the Jest API to make our tests more robust, such as:

- mocking API responses
- mocking and spying on modules
- using snapshots

## Languages

For now, the guide is in English and Japanese.
