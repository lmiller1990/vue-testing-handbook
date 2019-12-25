## 测试组件内的 Vuex -- mutations 和 actions

之前一篇讨论了测试使用了 `$store.state` 和 `$store.getters` 的组件，这两者都用来将当前状态提供给组件。而当断言一个组件正确 commit 了一个 mutation 或 dispatch 了一个 action 时，我们真正想做的是断言 `$store.commit` 和 `$store.dispatch` 以正确的处理函数（要调用的 mutation 或 action）和 payload 被调用了。

要做到这个有两种方式。一种是籍由 `createLocalVue` 使用一个真正的 Vuex store，另一种是使用一个 mock store。这两项技术都在 [这里](https://lmiller1990.github.io/vue-testing-handbook/vuex-in-components.html) 有所展示。让我们再次审视它们，这次是在 mutations 和 actions 的语境中。

本页中描述的测试源码可以在 [这里](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/ComponentWithButtons.spec.js) 找到。

## 创建组件

在这些例子里，我们将测试一个 `<ComponentWithButtons>` 组件：

```vue
<template>
  <div>
    <button 
      class="commit" 
      @click="handleCommit">
      Commit
    </button>

    <button 
      class="dispatch" 
      @click="handleDispatch">
      Dispatch
    </button>

    <button 
      class="namespaced-dispatch" 
      @click="handleNamespacedDispatch">
      Namespaced Dispatch
    </button>
  </div>
</template>

<script>
export default {
  name: "ComponentWithButtons",

  methods: {
    handleCommit() {
      this.$store.commit("testMutation", { msg: "Test Commit" })
    },

    handleDispatch() {
      this.$store.dispatch("testAction", { msg: "Test Dispatch" })
    },

    handleNamespacedDispatch() {
      this.$store.dispatch("namespaced/very/deeply/testAction", { msg: "Test Namespaced Dispatch" })
    }
  }
}
</script>
```

## 用一个真正的 Vuex store 测试 mutation

让我们先来编写一个测试 mutation 的 `ComponentWithButtons.spec.js`。请记住，我们要验证两件事：

1. 正确的 mutation 是否被 commit 了？
2. payload 正确吗？

我们将使用 `createLocalVue` 以避免污染全局 Vue 实例。

```js
import Vuex from "vuex"
import { createLocalVue, shallowMount } from "@vue/test-utils"
import ComponentWithButtons from "@/components/ComponentWithButtons.vue"

const localVue = createLocalVue()
localVue.use(Vuex)

const mutations = {
  testMutation: jest.fn()
}

const store = new Vuex.Store({ mutations })

describe("ComponentWithButtons", () => {

  it("commits a mutation when a button is clicked", async () => {
    const wrapper = shallowMount(ComponentWithButtons, {
      store, localVue
    })

    wrapper.find(".commit").trigger("click")
    await wrapper.vm.$nextTick()    

    expect(mutations.testMutation).toHaveBeenCalledWith(
      {},
      { msg: "Test Commit" }
    )
  })

})
```

注意测试被标记为 `await` 并调用了 `nextTick`。关于为何需要这样做可以参阅 [模拟用户输入](simulating-user-input.html#writing-the-test) 。

上面的测试中有很多代码 -- 尽管并没有什么让人兴奋的事情发生。我们创建了一个 `localVue` 并 use 了 Vuex，然后创建了一个 store，传入一个 Jest mock 函数 (`jest.fn()`) 代替 `testMutation`。Vuex mutations 总是以两个参数的形式被调用：第一个参数是当前 state，第二个参数是 payload。因为我们并没有为 store 声明任何 state，我们预期它被调用时第一个参数会是一个空对象。第二个参数预期为 `{ msg: "Test Commit" }`，也就是硬编码在组件中的那样。

有好多样板代码要去写，但这是个验证组件行为正确性的恰当而有效的方式。另一种替代方法 mock store 需要的代码更少。让我们来看看如何以那种方式编写一个测试并断言 `testAction` 被 dispatch 了。

## 用一个 mock store 测试 action

让我们来看看代码，然后和前面的测试类比、对比一下。请记住，我们要验证：

1. 正确的 action 被 dispatch 了
2. payload 是正常的

```js
it("dispatches an action when a button is clicked", async () => {
  const mockStore = { dispatch: jest.fn() }
  const wrapper = shallowMount(ComponentWithButtons, {
    mocks: {
      $store: mockStore 
    }
  })

  wrapper.find(".dispatch").trigger("click")
  await wrapper.vm.$nextTick()
  
  expect(mockStore.dispatch).toHaveBeenCalledWith(
    "testAction" , { msg: "Test Dispatch" })
})
```

这比前一个例子要紧凑多了。没有 `localVue`、没有 `Vuex` -- 不同于在前一个测试中我们用 `testMutation: jest.fn()` mock 掉了 `commit` 后会触发的函数，这次我们实际上 mock 了 `dispatch` 函数本身。因为 `$store.dispatch` 只是一个普通的 JavaScript 函数，我们有能力做到这点。而后我们断言第一个参数是正确的 action 处理函数名 `testAction`、第二个参数 payload 也正确。我们不关心实际发生的 -- 那可以被单独地测试。本次测试的目的就是简单地验证单击一个按钮会 dispatch 正确的带 payload 的 action。

使用真实的 store 或 mock store 全凭个人喜好。都是正确的。重要的事情是你在测试组件。

## 测试一个 Namespaced Action (或 Mutation)

第三个也是最终的例子展示了另一种测试一个 action 是否被以正确的参数 dispatch （或是 mutation 被 commit）的方式。这结合了以上讨论过的两项技术 -- 一个真实的 `Vuex` store，和一个 mock 的 `dispatch` 方法。


```js
it("dispatch a namespaced action when button is clicked", async () => {
  const store = new Vuex.Store()
  store.dispatch = jest.fn()

  const wrapper = shallowMount(ComponentWithButtons, {
    store, localVue
  })

  wrapper.find(".namespaced-dispatch").trigger("click")
  await wrapper.vm.$nextTick()

  expect(store.dispatch).toHaveBeenCalledWith(
    'namespaced/very/deeply/testAction',
    { msg: "Test Namespaced Dispatch" }
  )
})
```

根据我们感兴趣的模块，从创建一个 Vuex store 开始。我在测试内部声明了模块，但在真实 app 中，你可能需要引入组件依赖的模块。其后我们把 `dispatch` 方法替换为一个 `jest.fn` mock，并对它做了断言。

## 总结

在本章节中我们覆盖了：

1. 通过 `localVue` 和 mock 一个 mutation 来使用 Vuex
2. mock 掉 Vuex 的 API (`dispatch` 和 `commit`)
3. 通过一个 mock 的 `dispatch` 函数使用一个真实的 Vuex store

本页中描述的测试源码可以在 [这里](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/ComponentWithButtons.spec.js) 找到。
