## 测试计算属性

你可以在 [这里](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/NumberRenderer.spec.js) 找到本页中描述的测试。

测试计算属性特别的简单，因为它们就是普通的 JavaScript 函数。

让我们从看看测试一个 `computed` 属性的两种不同方式开始。我们将开发一个 `<NumberRenderer>` 组件，该组件基于一个 `numbers` 计算属性，要么渲染奇数，要么渲染偶数。 

## 编写测试

`<NumberRenderer>` 组件将接收一个 `even` prop，类型为布尔值。如果 `even` 为 `true`，组件应该渲染出 2, 4, 6, 8。若为 `false`，则渲染 1, 3, 5, 7, 9。数值列表会由一个叫做 `numbers` 的 `computed` 属性计算出来。

## 通过渲染值进行测试

测试代码：

```js
import { shallowMount } from "@vue/test-utils"
import NumberRenderer from "@/components/NumberRenderer.vue"

describe("NumberRenderer", () => {
  it("renders even numbers", () => {
    const wrapper = shallowMount(NumberRenderer, {
      propsData: {
        even: true
      }
    })

    expect(wrapper.text()).toBe("2, 4, 6, 8")
  })
})
```

在运行测试之前，先来建立 `<NumberRenderer>`：

```js
<template>
  <div>
  </div>
</template>

<script>
export default {
  name: "NumberRenderer",

  props: {
    even: {
      type: Boolean,
      required: true
    }
  }
}
</script>
```

现在我们启动了开发，并让报错信息指引我们的实现。运行 `yarn test:unit` 会产生：

```
● NumberRenderer › renders even numbers

  expect(received).toBe(expected) // Object.is equality

  Expected: "2, 4, 6, 8"
  Received: ""
```

看起来所有事情都正确的环环相扣。让我们来实现 `numbers`：

```js
computed: {
  numbers() {
    const evens = []

    for (let i = 1; i < 10; i++) {
      if (i % 2 === 0) {
        evens.push(i)
      }
    }

    return evens
  }
}
```

并更新模板以使用新的计算属性：

```html
<template>
  <div>
    {{ numbers }}
  </div>
</template>
```

运行 `yarn test:unit` 会产生：

```
FAIL  tests/unit/NumberRenderer.spec.js
● NumberRenderer › renders even numbers

  expect(received).toBe(expected) // Object.is equality

  Expected: "2, 4, 6, 8"
  Received: "[
    2,
    4,
    6,
    8
  ]"
```

数字是对了，但我们想要用渲染更好地格式化过的列表。让我们更新 `return` 值：

```js
return evens.join(", ")
```

现在 `yarn test:unit` 通过了！ 

## 用 `call` 进行测试 

我们来添加一个 `even: false` 情况下的测试。这次，我们将看到一个不用真正渲染组件而测试计算属性的替代方法。

首先还是编写测试：

```js
it("renders odd numbers", () => {
  const localThis = { even: false }

  expect(NumberRenderer.computed.numbers.call(localThis)).toBe("1, 3, 5, 7, 9")
})
```

不同于渲染组件并对 `wrapper.text()` 做出一个断言，这次我们使用 `call` 来提供一个包含 `numbers` 计算属性的 `this` 替代性上下文。让测试通过之后，我们也会看看假若不用 `call` 会发生什么。

运行当前测试会产生：

```
FAIL  tests/unit/NumberRenderer.spec.js
● NumberRenderer › renders odd numbers

  expect(received).toBe(expected) // Object.is equality

  Expected: "1, 3, 5, 7, 9"
  Received: "2, 4, 6, 8"
```

更新 `numbers`：

```js
numbers() {
  const evens = []
  const odds = []

  for (let i = 1; i < 10; i++) {
    if (i % 2 === 0) {
      evens.push(i)
    } else {
      odds.push(i)
    }
  }

  return this.even === true ? evens.join(", ") : odds.join(", ")
}
```

现在所有测试都通过了！那么如果我们在第二个测试中不用 `call` （译注：在名为 even 的 prop 没有默认为 true 的情况下）呢？尝试将其更新为：

```js
it("renders odd numbers", () => {
  const localThis = { even: false }

  expect(NumberRenderer.computed.numbers()).toBe("1, 3, 5, 7, 9")
})
```

现在测试失败了：

```
FAIL  tests/unit/NumberRenderer.spec.js
● NumberRenderer › renders odd numbers

  expect(received).toBe(expected) // Object.is equality

  Expected: "1, 3, 5, 7, 9"
  Received: "2, 4, 6, 8"
```

`vue` 自动将 `props` 绑定到 `this`。因为我们没有通过 `mount` 渲染过组件，所以 Vue 不为 `this` 绑定任何东西。如果此时你试试 `console.log(this)`，会发现上下文中只有 `computed` 对象：

```
{ numbers: [Function: numbers] }
```

所以我们（译注：即使 props 默认值符合预期）还是得使用 `call`，这使得我们能绑定替代的 `this` 对象，在本例中，会设置一个 `even` 属性。

## 用 `call` 还是 `shallowMount`？

两种技术对于测试计算属性都很有用。`call` 可以在以下情况被使用：

- 你在测试一个生命周期方法中执行了某些耗时操作的组件，而你想在针对计算属性的单元测试中绕过这些
- 你想 stub 掉 `this` 上的某些值。使用 `call` 并传递一个自定义的上下文会很有用。 

当然，你也要确保值被正确的渲染了，所以在测试计算属性时要保证选择了正确的技术，并测试所有边缘情况。

## 总结

- 可以使用 `shallowMount` 并断言渲染后的置标代码来测试计算属性
- 复杂的计算属性可以使用 `call` 被单独的测试
