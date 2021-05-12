:::tip This book is written for Vue.js 3 and Vue Test Utils v2.
Find the Vue.js 2 version [here](/).
:::

## What is this guide?

Welcome to the Vue.js testing handbook!

This is a collection of short, focused examples on how to test Vue components. It uses `vue-test-utils`, the official library for testing Vue components, and Jest, a modern testing framework. It covers the `vue-test-utils` API, as well as best practises for testing components.

Each section is independent from the others. We start off by setting up an environment with `vue-cli` and writing a simple test. Next, two ways to render a component are discussed - `mount` and `shallowMount`. The differences will be demonstrated and explained.

From then on, we cover how to test various scenarios that arise when testing components, such as testing components that:

- receive props
- use computed properties
- render other components
- emit events

and so forth. We then move on to more interesting cases, such as:

- best practises for testing Vuex (in components, and independently)
- testing Vue router
- testing involving third party components

We will also explore how to use the Jest API to make our tests more robust, such as:

- mocking API responses
- mocking and spying on modules
- using snapshots

## Further Reading

Other useful resources include:

- [Official docs](https://vue-test-utils.vuejs.org/v2/guide/introduction.html)
- I made free series on Vue Test Utils + Vue 3: [YouTube playlist](https://www.youtube.com/playlist?list=PLC2LZCNWKL9ahK1IoODqYxKu5aA9T5IOA)
- My [Vue.js 3 + Unit Testing Course](https://vuejs-course.com). VUEJS_COURSE_10_OFF for a $10 discount!
- [This course on VueSchool](https://vueschool.io/courses/learn-how-to-test-vuejs-components?friend=vth) by several Vue core contributors
