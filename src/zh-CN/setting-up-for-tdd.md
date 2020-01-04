## 安装 vue-cli

`vue-test-utils` 是 Vue 官方的测试库，并将在本指南中贯穿始终。它在浏览器和 Node.js 环境中皆可运行，并能配合任何 test runner 使用。在本指南中，我们将在 Node.js 环境运行测试。

`vue-cli` 是起步的最简单方式。它将建立一个项目，也会配置 Jest，一个流行的测试框架。其安装方法是：

```sh
yarn global add @vue/cli
```

或通过 npm：

```sh
npm install -g @vue/cli
```

通过运行 `vue create [project-name]` 来创建一个新项目。选择 "Manually select features" 和 "Unit Testing"，以及 "Jest" 作为 test runner。

一旦安装完成，`cd` 进入项目目录中并运行 `yarn test:unit`。如果一切顺利，你将看到：

```
 PASS  tests/unit/HelloWorld.spec.js
  HelloWorld.vue
    ✓ renders props.msg when passed (26ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        2.074s
```

恭喜，你已经运行了你的第一个通过的测试！

## 编写你的首个测试

我们已经运行了项目中既有的一个测试。让我们撸起袖子，编写我们自己的组件，以及一个测试吧。以 TDD 方式的传统来说，你先编写一个失败的测试，然后实现代码以使该测试通过。但现在，我们将先编写组件。

我们不再需要 `src/components/HelloWorld.vue` 或 `tests/unit/HelloWorld.spec.js` 了，所以你可以删掉它们。

## 创建 `Greeting` 组件

在 `src/components` 中创建一个 `Greeting.vue` 文件。在 `Greeting.vue` 中添加如下代码：

```vue
<template>
  <div>
    {{ greeting }}
  </div>
</template>

<script>
export default {
  name: "Greeting",

  data() {
    return {
      greeting: "Vue and TDD"
    }
  }
}
</script>
```

## 编写测试

`Greeting` 只有唯一的职责 -- 渲染 `greeting` 的值。其测试策略为：

1. 用 `mount` 渲染组件
2. 断言组件的文本中包含 "Vue and TDD"

在 `tests/unit` 中创建一个 `Greeting.spec.js`。在其内容中，引入 `Greeting.vue`，以及 `mount` 方法，并添加测试的概要：

```
import { mount } from '@vue/test-utils'
import Greeting from '@/components/Greeting.vue'

describe('Greeting.vue', () => {
  it('renders a greeting', () => {

  })
})
```

用于 TDD 的由很多不同的语法，我们将使用通常所见的 `describe` 和 `it` 语法，由 Jest 提供。`describe` 一般概述了测试会包含什么，在本例中写的是 `Greeting.vue`。`it` 表示测试应该完成的主题中一段单独的职责。随着我们为组件添加更多特性，在测试中就会添加更多 `it` 块。

现在我们应该用 `mount` 渲染组件。标准做法是将组件引用赋值给一个叫做 `wrapper` 的变量。我们也将输出结果打印出来，以确保一切正常：

```js
const wrapper = mount(Greeting)

console.log(wrapper.html())
```

## 运行测试

通过在终端中输入 `yarn test:unit` 来运行测试。`tests` 目录中任何以 `.spec.js` 结尾的文件都会被自动执行。如果不出所料，你应该看到：

```
PASS  tests/unit/Greeting.spec.js
Greeting.vue
  ✓ renders a greeting (27ms)

console.log tests/unit/Greeting.spec.js:7
  <div>
    Vue and TDD
  </div>
```

我们可以看到置标语言是正确的，测试也通过了。测试通过是因为并没有失败 -- 这个测试是不可能失败的，所以也没什么用。即便我们更改了 `Greeting.vue` 并从模板中删除了 `greeting`，测试都照样能通过。让我们改变这些。

## 做出断言

我们需要做出断言以确保组件行事正确。我们可以使用 Jest 的 `expect` API 做到这点。它看起来会是 `expect(result).to [matcher] (actual)` 这样。 

_matchers_ 是用来比较值和对象的一些方法。例如：

```js
expect(1).toBe(1)
```

一个关于 matchers 的完整列表可以在 [Jest 文档](http://jestjs.io/docs/en/expect) 中找到。`vue-test-utils` 中并不包含任何的 matchers -- Jest 提供的那些就足够了。我们要比较 `Greeting` 中的文本。可以这样写：

```js
expect(wrapper.html().includes("Vue and TDD")).toBe(true)
```

但 `vue-test-utils` 有一个更好的方式来比较置标 -- `wrapper.text`。让我们完成测试：

```js
import { mount } from '@vue/test-utils'
import Greeting from '@/components/Greeting.vue'

describe('Greeting.vue', () => {
  it('renders a greeting', () => {
    const wrapper = mount(Greeting)

    expect(wrapper.text()).toMatch("Vue and TDD")
  })
})
```

我们不再需要 `console.log` 了，所以你可以删除它了。通过 `yarn unit:test` 运行测试，如果一切正常将得到：

```
PASS  tests/unit/Greeting.spec.js
Greeting.vue
  ✓ renders a greeting (15ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        1.477s, estimated 2s
```

看起来不错，但你应该总是看见一个测试失败，再让它通过，以确保它是真实可行的。在传统的 TDD 中，你应该在编写真正的实现之前先写测试，看着它失败，然后使用报错来引导你的编码。让我们来更新 `Greeting.vue`，确保该测试是真正可行的：

```vue
<template>
  <div>
    {{ greeting }}
  </div>
</template>

<script>
export default {
  name: "Greeting",

  data() {
    return {
      greeting: "Vue without TDD"
    }
  }
}
</script>
```

现在通过 `yarn test:unit` 来运行测试：

```
FAIL  tests/unit/Greeting.spec.js
Greeting.vue
  ✕ renders a greeting (24ms)

● Greeting.vue › renders a greeting

  expect(received).toMatch(expected)

  Expected value to match:
    "Vue and TDD"
  Received:
    "Vue without TDD"

     6 |     const wrapper = mount(Greeting)
     7 |
  >  8 |     expect(wrapper.text()).toMatch("Vue and TDD")
       |                            ^
     9 |   })
    10 | })
    11 |

    at Object.<anonymous> (tests/unit/Greeting.spec.js:8:28)
```

Jest 给了我们一个良好的反馈。我们可以看到期望的和实际的结果，也能看到期望是在哪一行失败的。测试如期失败了。回到 `Greeting.vue` 做出修改并确保再次的测试能够通过。

下面我们将看到 `vue-test-utils` 提供的两个渲染组件的方法： `mount` 和 `shallowMount`。
