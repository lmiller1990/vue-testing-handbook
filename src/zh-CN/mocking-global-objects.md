## mock 全局对象

`vue-test-utils` 提供了一种 mock 掉 `Vue.prototype` 的简单方式，不但对测试用例适用，也可以为所有测试设置默认的 mock。

以下例子中用到的测试可以在 [这里](https://github.com/lmiller1990/vue-testing-handbook/blob/master/demo-app/tests/unit/Bilingual.spec.js) 找到。

## mocks 加载选项

[mocks 加载选项](https://vue-test-utils.vuejs.org/api/options.html#mocks) 是一种将任何属性附加到 `Vue.prototype` 上的方式。这通常包括：

- `$store`, 对于 Vuex
- `$router`, 对于 Vue Router
- `$t`, 对于 vue-i18n

以及其他种种。

## vue-i18n 的例子

对 Vuex 和 Vue Router 的使用会在相关章节中讨论，参考 [这里](https://lmiller1990.github.io/vue-testing-handbook/vuex-in-components.html) 和 [这里](https://lmiller1990.github.io/vue-testing-handbook/vue-router.html)。此处我们来看一个 [vue-i18n](https://github.com/kazupon/vue-i18n) 的例子。虽然可以为每个测试用到 `createLocalVue` 并安装 `vue-i18n`，但那样可能会让事情难以处理并引入一堆样板。首先，组件 `<Bilingual>` 用到了 `vue-i18n`:

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

先在另一个文件中弄好翻译，然后通过 `$t` 引用，这就是 `vue-i18n` 的工作方式。在本次测试中，虽然并不会真正关心翻译文件看起来什么样，不过还是看一看这次用到的：

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

B基于这个 locale，正确的翻译将被渲染出来。我们先不用 mock，尝试在测试中渲染该组件。

```js
import { shallowMount } from "@vue/test-utils"
import Bilingual from "@/components/Bilingual.vue"

describe("Bilingual", () => {
  it("renders successfully", () => {
    const wrapper = shallowMount(Bilingual)
  })
})
```

通过 `yarn test:unit` 运行测试将抛出一堆错误堆栈。若仔细端详输出则会发现：

```
[Vue warn]: Error in config.errorHandler: "TypeError: _vm.$t is not a function"
```

这是因为我们并未安装 `vue-i18n`，所以全局的 `$t` 方法并不存在。我们试试 `mocks` 加载选项：

```js
import { shallowMount } from "@vue/test-utils"
import Bilingual from "@/components/Bilingual.vue"

describe("Bilingual", () => {
  it("renders successfully", () => {
    const wrapper = shallowMount(Bilingual, {
      mocks: {
        $t: (msg) => msg
      }
    })
  })
})
```

现在测试通过了！`mocks` 选项用处多多，而我觉得最最常用的正是开头提到过的那三样。

## 使用配置设置默认的 mocks

有时需要一个 mock 的默认值，这样就不用为每个测试用例都设置一遍了。可以用 `vue-test-utils` 提供的 [config](https://vue-test-utils.vuejs.org/api/#vue-test-utils-config-options) API 来实现。让我们展开 `vue-i18n` 的例子，通过像下面这样做，你可以在任意位置设置默认的 mocks：

```js
import VueTestUtils from "@vue/test-utils"

VueTestUtils.config.mocks["mock"] = "Default Mock Value"
```

本文的这个 demo 项目中用到了 Jest，所以我将把默认 mock 声明在 `jest.init.js` 文件中，该文件会在测试运行前被自动加载。同时我也会导入并应用此前用于示例的翻译对象，并将其用在 mock 实现中。

```js
//jest.init.js

import VueTestUtils from "@vue/test-utils"
import translations from "./src/translations.js"

const locale = "en"

VueTestUtils.config.mocks["$t"] = (msg) => translations[locale][msg]
```

现在尽管还是用了一个 mock 过的 `$t` 函数，但会渲染一个真实的翻译了。再次运行测试，这次移除了 `mocks` 加载选项并用 `console.log` 打印了 `wrapper.html()`：

```js
describe("Bilingual", () => {
  it("renders successfully", () => {
    const wrapper = shallowMount(Bilingual)

    console.log(wrapper.html())
  })
})
```

测试通过，以下结构被渲染出来：

```
<div class="hello">
  Hello world!
</div>
```

你可以在 [这里](https://lmiller1990.github.io/vue-testing-handbook/vuex-in-components.html#using-a-mock-store) 读到使用 `mocks` 测试 Vuex。所用技术是相同的。

## 总结

本文讨论了：

- 在测试用例中使用 `mocks` 以 mock 一个全局对象
- 用 `config.mocks` 设置默认的 mock

