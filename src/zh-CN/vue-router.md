## Vue Router

由于路由通常会把多个组件牵扯到一起操作，所以一般对其的测试都会等到 端到端/集成 测试阶段进行，处于 [测试金字塔](https://medium.freecodecamp.org/the-front-end-test-pyramid-rethink-your-testing-3b343c2bca51) 的上层。不过，对你的路由做一些单元测试还是大有裨益的。

正如先前章节所讨论的，对于与路由交互的组件，有两种测试方式：

1. 使用一个真正的 router 实例
2. mock 掉 `$route` 和 `$router` 全局对象

因为大多数 Vue 应用所使用的都是官方的 Vue Router，所以本文会聚焦于这个插件。

在本页中所描述的测试源码可以在 [这里](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/App.spec.js) and [here](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/NestedRoute.spec.js) 找到。

## 创建组件

我们会弄一个简单的 `<App>`，包含一个 `/nested-child` 路由。访问 `/nested-child` 则渲染一个 `<NestedRoute>` 组件。创建 `App.vue` 文件，并定义如下的最小化组件：

```vue
<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>

export default {
  name: 'app'
}
</script>
```

`<NestedRoute>` 同样是最小化的：

```vue
<template>
  <div>Nested Route</div>
</template>

<script>
export default {
  name: "NestedRoute"
}
</script>
```

## 创建 Router 和 Routes

现在我们需要一些路由用以测试。让我们从以下路由开始：

```js
import NestedRoute from "@/components/NestedRoute.vue"

export default [
  { path: "/nested-route", component: NestedRoute }
]
```

在真实的应用中，你一般会创建一个 `router.js` 文件并导入定义好的路由，并且写出类似这样的代码：

```js
import Vue from "vue"
import VueRouter from "vue-router"
import routes from "./routes.js"

Vue.use(VueRouter)

export default new VueRouter({ routes })
```

为避免调用 `Vue.use(...)` 污染测试的全局命名空间，我们将会在测试中创建基础的路由。这让我们能在单元测试期间更细粒度的控制应用的状态。

## 编写测试

先看点代码再说吧。我们来测试 `App.vue`，所以相应的增加一个 `App.spec.js`：

```js
import { shallowMount, mount, createLocalVue } from "@vue/test-utils"
import App from "@/App.vue"
import VueRouter from "vue-router"
import NestedRoute from "@/components/NestedRoute.vue"
import routes from "@/routes.js"

const localVue = createLocalVue()
localVue.use(VueRouter)

describe("App", () => {
  it("renders a child component via routing", async () => {
    const router = new VueRouter({ routes })
    const wrapper = mount(App, { 
      localVue,
      router
    })

    router.push("/nested-route")
    await wrapper.vm.$nextTick()

    expect(wrapper.find(NestedRoute).exists()).toBe(true)
  })
})
```

* 请注意测试中标记了 `await` 并调用了 `nextTick`。查看 [这里](/simulating-user-input.html#writing-the-test) 了解其背后原因的更多细节。

照例，一开始先把各种模块引入我们的测试；尤其是引入了应用中所需的真实路由。这在某种程度上很理想 -- 若真实路由一旦挂了，单元测试就失败，这样我们就能在部署应用之前修复这类问题。

可以在 `<App>` 测试中使用一个相同的 `localVue`，并将其声明在第一个 `describe` 块之外。不过，由于要为不同的路由做不同的测试，所以把 `router` 定义在 `it` 块里。

另一个值得注意的有别于其他指南的点是，本书中用了 `mount` 而非 `shallowMount`。如果用了 `shallowMount`，则 `<router-link>` 就会被忽略，不管当前路由是什么，渲染的其实都是一个无用的 stub 组件。

## 为使用了 `mount` 的大型渲染树做些变通

使用 `mount` 在某些情况下很好，但有时却是不理想的。比如，当渲染整个 `<App>` 组件时，正赶上渲染树很大，包含了许多组件，一层层的组件又有自己的子组件。这么些个子组件都要触发各种生命周期钩子、发起 API 请求什么的。

如果你在用 Jest，其强大的 mocking 系统为此提供了一个优雅的解决方法。可以简单的 mock 掉子组件，在本例中也就是 `<NestedRoute>`。使用了下面的写法后，以上测试也将能通过：

```js
jest.mock("@/components/NestedRoute.vue", () => ({
  name: "NestedRoute",
  render: h => h("div")
}))
```

## 使用一个 Mock Router

有时真实路由也不是必要的。现在升级一下 `<NestedRoute>`，让其根据当前 URL 的查询字符串显示一个用户名。这次我们用 TDD 实现这个特性。以下是一个基础测试，简单的渲染了组件并写了一句断言：

```js
import { shallowMount } from "@vue/test-utils"
import NestedRoute from "@/components/NestedRoute.vue"
import routes from "@/routes.js"

describe("NestedRoute", () => {
  it("renders a username from query string", () => {
    const username = "alice"
    const wrapper = shallowMount(NestedRoute)

    expect(wrapper.find(".username").text()).toBe(username)
  })
})
```

然而我们（译注：在前面提及过的最小化  `<NestedRoute>` 的中）尚没有 `<div class="username">` ，所以一运行测试就会看到：

```
FAIL  tests/unit/NestedRoute.spec.js
  NestedRoute
    ✕ renders a username from query string (25ms)

  ● NestedRoute › renders a username from query string

    [vue-test-utils]: find did not return .username, cannot call text() on empty Wrapper
``` 

更新一下 `<NestedRoute>`：

```vue
<template>
  <div>
    Nested Route
    <div class="username">
      {{ $route.params.username }}
    </div>
  </div>
</template>
```

现在报错变为了：

```
FAIL  tests/unit/NestedRoute.spec.js
  NestedRoute
    ✕ renders a username from query string (17ms)

  ● NestedRoute › renders a username from query string

    TypeError: Cannot read property 'params' of undefined
```

这是因为 `$route` 并不存在。 我们当然可以用一个真正的路由，但在这样的情况下只用一个 `mocks` 加载选项会更容易些：

```js
it("renders a username from query string", () => {
  const username = "alice"
  const wrapper = shallowMount(NestedRoute, {
    mocks: {
      $route: {
        params: { username }
      }
    }
  })

  expect(wrapper.find(".username").text()).toBe(username)
})
```

这样测试就能通过了。在本例中，我们没有做任何的导航或是和路由的实现相关的任何其他东西，所以 `mocks` 就挺好。我们并不真的关心 `username` 是从查询字符串中怎么来的，只要它出现就好。

不同于由 Vue Router 负责的客户端路由，通常服务器端也会提供路由功能。在这种情况下，使用 `mocks` 在一个测试中去设置查询字符串，是替代使用一个真正 Vue Router 实例的一种良好手段。


## 测试路由钩子的策略

Vue Router 提供了多种类型的路由钩子, 称为 ["navigation guards"](https://router.vuejs.org/guide/advanced/navigation-guards.html)。举两个例子如：

1. 全局 guards (`router.beforeEach`)。在 router 实例上声明。
2. 组件内 guards，比如 `beforeRouteEnter`。在组件中声明。

要确保这些运作正常，一般是集成测试的工作，因为需要一个使用者从一个路由导航到另一个。不过，你也可以用单元测试检验导航 guards 中调用的函数是否正常工作，并更快的获得潜在 bugs 的反馈。这里列出一些如何从导航 guards 中解耦逻辑的策略，以及为此编写的单元测试。

## 全局 guards

比方说当路由中包含 `shouldBustCache` 元数据的情况下，有那么一个 `bustCache` 函数就应该被调用。路由可能长这样：

```js
import NestedRoute from "@/components/NestedRoute.vue"

export default [
  {
    path: "/nested-route",
    component: NestedRoute,
    meta: {
      shouldBustCache: true
    }
  }
]
```

之所以使用 `shouldBustCache` 元数据，是为了让缓存无效，从而确保用户不会取得旧数据。一种可能的实现如下：

```js
import Vue from "vue"
import VueRouter from "vue-router"
import routes from "./routes.js"
import { bustCache } from "./bust-cache.js"

Vue.use(VueRouter)

const router = new VueRouter({ routes })

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.shouldBustCache)) {
    bustCache()
  }
  next()
})

export default router
```

在你的单元测试中，你 __可能__ 想导入 router 实例，并试图通过 `router.beforeHooks[0]()` 的写法调用 `beforeEach`；但这将抛出一个关于 `next` 的错误 -- 因为没法传入正确的参数。针对这个问题，一种策略是在将 `beforeEach` 导航钩子耦合到路由中之前，解耦并单独导出它。做法是这样的：

```js
export function beforeEach(to, from, next) {
  if (to.matched.some(record => record.meta.shouldBustCache)) {
    bustCache()
  }
  next()
}

router.beforeEach((to, from, next) => beforeEach(to, from, next))

export default router
```

再写测试就容易了，虽然写起来有点长：

```js
import { beforeEach } from "@/router.js"
import mockModule from "@/bust-cache.js"

jest.mock("@/bust-cache.js", () => ({ bustCache: jest.fn() }))

describe("beforeEach", () => {
  afterEach(() => {
    mockModule.bustCache.mockClear()
  })

  it("busts the cache when going to /user", () => {
    const to = {
      matched: [{ meta: { shouldBustCache: true } }]
    }
    const next = jest.fn()

    beforeEach(to, undefined, next)

    expect(mockModule.bustCache).toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  it("does not bust the cache when going to /user", () => {
    const to = {
      matched: [{ meta: { shouldBustCache: false } }]
    }
    const next = jest.fn()

    beforeEach(to, undefined, next)

    expect(mockModule.bustCache).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })
})
```

最主要的有趣之处在于，我们借助 `jest.mock`，mock 掉了整个模块，并用 `afterEach` 钩子将其复原。通过将 `beforeEach` 导出为一个已结耦的、普通的 Javascript 函数，从而让其在测试过程中不成问题。

为了确定 hook 真的调用了 `bustCache` 并且显示了最新的数据，可以使用一个诸如 [Cypress.io](https://www.cypress.io/) 的端到端测试工具，它也在应用脚手架 `vue-cli` 的选项中提供了，可以被使用。

## 组件 guards

一旦将组件 guards 视为已结耦的、普通的 Javascript 函数，则它们也是易于测试的。假设我们为 `<NestedRoute>` 添加了一个 `beforeRouteLeave` hook：

```vue
<script>
import { bustCache } from "@/bust-cache.js"
export default {
  name: "NestedRoute",

  beforeRouteLeave(to, from, next) {
    bustCache()
    next()
  }
}
</script>
```

对在全局 guards 中的方法照猫画虎就可以测试它了：

```js
// ...
import NestedRoute from "@/components/NestedRoute.vue"
import mockModule from "@/bust-cache.js"

jest.mock("@/bust-cache.js", () => ({ bustCache: jest.fn() }))

it("calls bustCache and next when leaving the route", async () => {
  const wrapper = shallowMount(NestedRoute);
  const next = jest.fn()
  NestedRoute.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next)
  await wrapper.vm.$nextTick()


  expect(mockModule.bustCache).toHaveBeenCalled()
  expect(next).toHaveBeenCalled()
})
```

这种形式的单元测试行之有效，可以在开发过程中立即得到反馈；但由于路由和导航 hooks 常与各种组件互相影响以达到某些效果，也应该做一些集成测试以确保所有事情如预期般工作。

## 总结

本文覆盖了：

- 测试由 Vue Router 条件渲染的组件
- 用 `jest.mock` 和 `localVue` 去 mock Vue 组件
- 从 router 中解耦全局导航 guard 并对其独立测试
- 用 `jest.mock` 来 mock 一个模块

本页中描述的测试源码可以在 [这里](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/App.spec.js) and [here](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/NestedRoute.spec.js) 找到。
