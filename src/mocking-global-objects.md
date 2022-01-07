:::tip This book is written for Vue.js 2 and Vue Test Utils v1.
Find the Vue.js 3 version [here](/v3/).
:::

## Mocking global objects

`vue-test-utils` provides a simple way to mock global objects attached to `Vue.prototype`, both on test by test basis and to set a default mock for all tests.

The test used in the following example can be found [here](https://github.com/lmiller1990/vue-testing-handbook/blob/master/demo-app/tests/unit/Bilingual.spec.js).

## The mocks mounting option

The [mocks mounting option](https://vue-test-utils.vuejs.org/api/options.html#mocks) is one way to set the value of any properties attached to `Vue.prototype`. This commonly includes:

- `$store`, for Vuex
- `$router`, for Vue Router
- `$t`, for vue-i18n

and many others.

## Example with vue-i18n

Use with Vuex and Vue Router are discussed in the respective sections, [here](https://lmiller1990.github.io/vue-testing-handbook/vuex-in-components.html) and [here](https://lmiller1990.github.io/vue-testing-handbook/vue-router.html). Let's see an example with [vue-i18n](https://github.com/kazupon/vue-i18n). While it would be possible to use `createLocalVue` and install `vue-i18n` for each test, that would quickly get cumbersome and introduce a lot of boilerplate. First, a `<Bilingual>` component that uses `vue-i18n`:

```html
<template>
  <div class="hello">
    {{ $t("helloWorld") }}
  </div>
</template>

<script>
  export default {
    name: "Bilingual"
  }
</script>
```

The way `vue-i18n` works is you declare your translation in another file, then reference them with `$t`. For the purpose of this test it doesn't really matter what the translation file looks like, but for this component it could look like this:

```js
export default {
  "en": {
    helloWorld: "Hello world!"
  },
  "ja": {
    helloWorld: "こんにちは、世界！"
  }
}
```

Based on the locale, the correct translation is rendered. Let's try and render the component in a test, without any mocking.

```js
import { mount } from "@vue/test-utils"
import Bilingual from "@/components/Bilingual.vue"

describe("Bilingual", () => {
  it("renders successfully", () => {
    const wrapper = mount(Bilingual)
  })
})
```

Running this test with `yarn test:unit` throws a huge stack trace. If you look through the output carefully, you can see:

```
[Vue warn]: Error in config.errorHandler: "TypeError: _vm.$t is not a function"
```

This is because we did not install `vue-i18n`, so the global `$t` method does not exist. Let's mock it using the `mocks` mounting option:

```js
import { mount } from "@vue/test-utils"
import Bilingual from "@/components/Bilingual.vue"

describe("Bilingual", () => {
  it("renders successfully", () => {
    const wrapper = mount(Bilingual, {
      mocks: {
        $t: (msg) => msg
      }
    })
  })
})
```

Now the test passes! There are lots of uses for the `mocks` option. Most frequently I find myself mocking the global objects provided by the three packages mentioned above.

## Settings default mocks using config

Sometimes you want to have a default value for the mock, so you don't create it on a test by test basis. You can do this using the [config](https://vue-test-utils.vuejs.org/api/#vue-test-utils-config-options) API provided by `vue-test-utils`. Let's expand the `vue-i18n` example. You can set default mocks anywhere by doing the following:

```js
import { config } from "@vue/test-utils"

config.mocks["mock"] = "Default Mock Value"
```

The demo project for this guide is using Jest, so I will declare the default mock in `jest.init.js`, which is loaded before the tests are run automatically. I will also import the example translations object from earlier, and use it in the mock implementation.

```js
import VueTestUtils from "@vue/test-utils"
import translations from "./src/translations.js"

const locale = "en"

VueTestUtils.config.mocks["$t"] = (msg) => translations[locale][msg]
```

Now a real translation will be rendered, despite using a mocked `$t` function. Run the test again, this time using `console.log` on `wrapper.html()` and removing the `mocks` mounting option:

```js
describe("Bilingual", () => {
  it("renders successfully", () => {
    const wrapper = mount(Bilingual)

    console.log(wrapper.html())
  })
})
```

The test passes, and the following markup is rendered:

```
<div class="hello">
  Hello world!
</div>
```

Note: if the test is still failing, it's likely because `jest.init.js` is not set to load before the tests run.  Ensure that your `jest.config.js` file includes the following:

```js
module.exports = {
  setupFiles: ["<rootDir>/jest.init.js"]
}
```
and then re-run the test.

You can read about using `mocks` to test Vuex [here](https://lmiller1990.github.io/vue-testing-handbook/vuex-in-components.html#using-a-mock-store). The technique is the same.

## Conclusion

This guide discussed:

- using `mocks` to mock a global object on a test by test basis
- using `config.mocks` to set a default mock 
