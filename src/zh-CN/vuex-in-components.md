## 测试组件内的 Vuex -- state 和 getters

本页中描述的测试源码可以在 [这里](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/ComponentWithVuex.spec.js) 找到。

## 使用 `createLocalVue` 测试 `$store.state`

在一个普通的 Vue 应用中，我们使用 `Vue.use(Vuex)` 来安装 Vuex 插件，并将一个新的 Vuex store 传入 app 中。如果我们也在一个单元测试中做同样的事，那么，所有单元测试都得接收那个 Vuex store，尽管测试中根本用不到它。`vue-test-utils` 提供了一个 `createLocalVue` 方法，用来为测试提供一个临时 `Vue` 实例。让我们看看如何使用它。首先，是一个基于 store 的 state 渲染出一个 username 的 `<ComponentWithGetters>` 组件。

```html
<template>
  <div>
    <div class="username">
      {{ username }}
    </div>
  </div>
</template>

<script>
export default {
  name: "ComponentWithVuex",

  data() {
    return {
      username: this.$store.state.username
    }
  }
}
</script>
```

我们可以使用 `createLocalVue` 创建一个临时的 `Vue` 实例，并用其安装 Vuex。而后我们将一个新的 `store` 传入组件的加载选项中。完整的测试看起来是这样的：

```js
import Vuex from "vuex"
import { shallowMount, createLocalVue } from "@vue/test-utils"
import ComponentWithVuex from "@/components/ComponentWithVuex.vue"

const localVue = createLocalVue()
localVue.use(Vuex)

const store = new Vuex.Store({
  state: {
    username: "alice"
  }
})

describe("ComponentWithVuex", () => {
  it("renders a username using a real Vuex store", () => {
    const wrapper = shallowMount(ComponentWithVuex, { 
      store, 
      localVue 
    })

    expect(wrapper.find(".username").text()).toBe("alice")
  })
})
```

测试通过。创建一个新的 `localVue` 实例引入了一些样板文件（boilerplate），并且测试也很长。如果你有好多使用了 Vuex store 的组件要测试，一个替代方法是使用 `mocks` 加载选项，用以简化 store 的 mock。

## 使用一个 mock 的 store

通过使用 `mocks` 加载选项，可以 mock 掉全局的 `$store` 对象。这意味着你不需要使用 `createLocalVue`，或创建一个新的 Vuex store 了。使用此项技术，以上测试可以重写成这样：

```js
it("renders a username using a mock store", () => {
  const wrapper = shallowMount(ComponentWithVuex, {
    mocks: {
      $store: {
        state: { username: "alice" }
      }
    }
  })

  expect(wrapper.find(".username").text()).toBe("alice")
})
```

我个人更喜欢这种实现。所有必须的数据被声明在测试内部，同时它也更紧凑一点儿。当然两种技术都很有用，并没有哪种更好哪种更差之分。

## 测试 `getters`

使用上述技术，`getters` 同样易于测试。首先，是用于测试的组件：

```html
<template>
  <div class="fullname">
    {{ fullname }}
  </div>
</template>

<script>
export default {
  name: "ComponentWithGetters",

  computed: {
    fullname() {
      return this.$store.getters.fullname
    }
  }
}
</script>
```

我们想要断言组件正确地渲染了用户的 `fullname`。对于该测试，我们不关心 `fullname` 来自何方，组件渲染正常就行。

先看看用真实的 Vuex store 和 `createLocalVue`，测试看起来是这样的：

```js
const localVue = createLocalVue()
localVue.use(Vuex)

const store = new Vuex.Store({
  state: {
    firstName: "Alice",
    lastName: "Doe"
  },

  getters: {
    fullname: (state) => state.firstName + " " + state.lastName
  }
})

it("renders a username using a real Vuex getter", () => {
  const wrapper = shallowMount(ComponentWithGetters, { store, localVue })

  expect(wrapper.find(".fullname").text()).toBe("Alice Doe")
})
```

测试很紧凑 -- 只有两行代码。不过也引入了很多设置代码 -- 我们基本上重建了 Vuex store。一个替代方法是引入有着真正 getters 的真实的 Vuex store。这将引入测试中的另一项依赖，当开发一个大系统时，Vuex store 可能由另一位程序员开发，也可能尚未实现。

让我看看使用 `mocks` 加载选项编写测试的情况：

```js
it("renders a username using computed mounting options", () => {
  const wrapper = shallowMount(ComponentWithGetters, {
    mocks: {
      $store: {
        getters: {
          fullname: "Alice Doe"
        }
      }
    }
  })

  expect(wrapper.find(".fullname").text()).toBe("Alice Doe")
})
```

现在全部所需的数据都包含在测试中了。太棒了！我特喜欢这个，因为测试是全包含的（fully contained），理解组件应该做什么所需的所有知识都都包含在测试中。

使用 `computed` 加载选项，我们甚至能让测试变得更简单。

## 用 `computed` 来模拟 getters

getters 通常被包裹在 `computed` 属性中。请记住，这个测试就是为了在给定 store 中的当前 state 时，确保组件行为的正确性。我们不测试 `fullname` 的实现或是要瞧瞧 `getters` 是否工作。这意味着我们可以简单地替换掉真实 store，或使用 `computed` 加载选项 mock 掉 store。测试可以重写为：

```js
it("renders a username using computed mounting options", () => {
  const wrapper = shallowMount(ComponentWithGetters, {
    computed: {
      fullname: () => "Alice Doe"
    }
  })

  expect(wrapper.find(".fullname").text()).toBe("Alice Doe")
})
```

这比之前两个测试更简洁了，并且仍然表达了组件的意图。

## `mapState` 和 `mapGetters` 辅助选项

上述技术都能与 Vuex 的 `mapState` 和 `mapGetters` 辅助选项结合起来工作。我们可以将 `ComponentWithGetters` 更新为：

```js
import { mapGetters } from "vuex"

export default {
  name: "ComponentWithGetters",

  computed: {
    ...mapGetters([
      'fullname'
    ])
  }
}
```

测试仍然通过。

## 总结

本文讨论了：

- 使用 `createLocalVue` 和真实 Vuex store 测试 `$store.state` 和 `getters`
- 使用 `mocks` 加载选项 mock 掉 `$store.state` 和 `getters`
- 使用 `computed` 加载选项以设置 Vuex getter 的期望值

单独地测试 Vuex getters 实现的技术可以在 [这篇向导](https://lmiller1990.github.io/vue-testing-handbook/vuex-getters.html) 中找到。

本页中描述的测试源码可以在 [这里](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/ComponentWithVuex.spec.js) 找到。
