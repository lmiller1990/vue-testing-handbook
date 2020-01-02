## 找到元素

通过 `find` 方法，`vue-test-utils` 提供了找到并断言 HTML 元素或其他 Vue 组件是否存在的许多方式。`find` 的主要用处就是断言一个组件是否正确地渲染了元素或子组件。

在本页中所描述的测试源码可以在 [这里](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/Parent.spec.js) 找到。

## 创建组件

对于本例，我们将创建一个 `<Child>` 组件和一个 `<Parent>` 组件。

Child: 

```vue
<template>
  <div>Child</div>
</template>

<script>
export default {
  name: "Child"
}
</script>
```

Parent:

```vue
<template>
  <div>
    <span v-show="showSpan">
      Parent Component
    </span>
    <Child v-if="showChild" />
  </div>
</template>

<script>
import Child from "./Child.vue"

export default {
  name: "Parent",

  components: { Child },

  data() {
    return {
      showSpan: false,
      showChild: false
    }
  }
}
</script>
```

## 有着 `querySelector` 语法的 `find`

正如通过使用 `document.querySelector` 语法，可以轻易地选取普通的 HTML 元素；`vue-test-utils` 也提供了一个 `isVisible` 方法以检查元素是否被 `v-show` 条件性地渲染了。创建一个 `Parent.spec.js`，并输入下面的测试代码：

```js
import { mount, shallowMount } from "@vue/test-utils"
import Parent from "@/components/Parent.vue"

describe("Parent", () => {
  it("does not render a span", () => {
    const wrapper = shallowMount(Parent)

    expect(wrapper.find("span").isVisible()).toBe(false)
  })
})
```

因为 `v-show="showSpan"` 默认为 `false`，我们期望找到的 `<span>` 元素的 `isVisible` 方法会返回 `false`。当运行 `yarn test:unit` 后测试通过了。下一步，添加一个当 `showSpan` 为 `true` 时的测试：

```js
it("does render a span", () => {
  const wrapper = shallowMount(Parent, {
    data() {
      return { showSpan: true }
    }
  })

  expect(wrapper.find("span").isVisible()).toBe(true)
})
```

它也通过了！

和 `isVisible` 之于 `v-show` 非常相似的是，`vue-test-utils` 提供了一个 `exists` 方法以用来测试当使用 `v-if` 时元素被条件性渲染的情况。

## 通过 `name` 和 `Component` 找到组件

找到子组件和找到普通 HTML 元素稍有不同。主要有两种方法来断言 Vue 子组件的存在：

1. `find(Component)`
2. `find({ name: "ComponentName" })`

这两种方法在一个例子中可能更好理解一些。让我们从 `find(Component)` 语法开始。这需要 `import` 组件，并将其引用传入 `find` 函数中。

```js
import Child from "@/components/Child.vue"

it("does not render a Child component", () => {
  const wrapper = shallowMount(Parent)

  expect(wrapper.find(Child).exists()).toBe(false)
})
```

`find` 的实现颇为复杂，因为它要以 `querySelector` 的语法工作，同时也有很多其他的语法。你可以看看源码中关于找到 Vue 子组件的 [这个部分](https://github.com/vuejs/vue-test-utils/blob/dev/packages/test-utils/src/find.js)。基本上它检查了每个渲染过的子组件的 `name` 属性，其后检查 `constructor`，还有一些其他属性。

正如上一段中提到的，当你传给 `find` 方法一个组件时，`name` 属性是其检查手段之一（译注：源码在 [这里](https://github.com/vuejs/vue-test-utils/blob/dev/packages/test-utils/src/matches.js)）。其实除了传递一个组件，你也可以简单地传入一个有着正确 `name` 属性的对象。这意味着你无需 `import` 相应的组件。让我们用这种方法来试试 `<Child>` 应当被渲染的情况：

```js
it("renders a Child component", () => {
  const wrapper = shallowMount(Parent, {
    data() {
      return { showChild: true }
    }
  })

  expect(wrapper.find({ name: "Child" }).exists()).toBe(true)
})
```

通过！使用 `name` 会有那么一点不直观, 所以引入真实的组件也是个辙。另一个选项是像头两个例子中出现的那样简单地添加一个 `class` 或 `id` 并用 `querySelector` 的语法样式查询。 

## `findAll`

想要断言一定数量的元素都被渲染了也是个频发的场景。一个通常的案例是通过 `v-for` 渲染出的一个项目列表。比如下面这个 `<ParentWithManyChildren>` 就渲染出了若干 `<Child>` 组件。

```js
<template>
  <div>
    <Child v-for="id in [1, 2 ,3]" :key="id" />
  </div>
</template>

<script>
import Child from "./Child.vue"

export default {
  name: "ParentWithManyChildren",

  components: { Child }
}
</script>
```

我们可以像这样用 `findAll` 编写测试以断言有三个 `<Child>` 组件被渲染了：

```js
it("renders many children", () => {
  const wrapper = shallowMount(ParentWithManyChildren)

  expect(wrapper.findAll(Child).length).toBe(3)
})
```

运行 `yarn test:unit` 显示测试通过。对于 `findAll` 同样适用 `querySelector` 语法。

## 总结

本页覆盖了：

- 使用有着 `querySelector` 语法的 `find` 和 `findAll`
- `isVisible` 和 `exists`
- 将组件或名称选择器传入 `find` 和 `findAll`

在本页中所描述的测试源码可以在 [这里](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/Parent.spec.js) 找到。

