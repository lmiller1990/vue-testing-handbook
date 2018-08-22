## Mocking Modules

When writing unit tests, it is often convinient (or even ideal) to mock or stub out external dependencies, so the test can be more focused and less prone to failure. Jest allows mocking of single functions (`jest.fn`), and modules (`jest.mock`). Mocking functions using `jest.fn` is discussed in the mutations and actions guide [here](https://lmiller1990.github.io/vue-testing-handbook/vuex-in-components-mutations-and-actions.html#testing-with-a-real-vuex-store). Mocking modules, specifically `axios` and `vue-router` using `jest.mock` is demonstrated in the [actions guide](https://lmiller1990.github.io/vue-testing-handbook/vuex-actions.html#testing-actions) and [router guide](https://lmiller1990.github.io/vue-testing-handbook/vue-router.html).


Not directly related to Vue testing, more specific to Jest. Jest is used heavily throughout this handbook, though, and becoming widely adopted in the industry, so I think it deserves a section.

Some ideas:

1. reference the sections of the existing guide using Jest
2. Talk about the different kind of mocks and their use cases for Vue testing

- Manual mocks
- ES6 class mocks
- automatic mock
- calling `mockImplentation`?

Ref: https://jestjs.io/docs/en/es6-class-mocks#the-4-ways-to-create-an-es6-class-mock
