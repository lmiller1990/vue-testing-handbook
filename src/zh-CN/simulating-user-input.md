## 触发事件

Vue 组件最常做的一件事情就是监听来自用户的输入了。`vue-test-utils` 和 Jest 让测试输入变得简单。让我们看看如何用 `trigger` 和 Jest mocks 来验证我们的组件是工作正常的吧。

本页中所描述的测试源码可以在 [这里](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/FormSubmitter.spec.js) 找到。

## 创建组件

我们将创建一个简单的表单组件 `<FormSubmitter>`，包含一个 `<input>` 以及一个 `<button>`。当点击按钮时，有些事情应该发生。第一个例子会简单地显示一个成功消息，而后我们将继续写一个更有趣的例子来将表单提交到外部端点。

创建一个 `<FormSubmitter>` 并编写模板：

```html
<template>
  <div>
    <form @submit.prevent="handleSubmit">
      <input v-model="username" data-username>
      <input type="submit">
    </form>

    <div 
      class="message" 
      v-if="submitted"
    >
      Thank you for your submission, {{ username }}.
    </div>
  </div>
</template>
```

当用户提交表单时，我们会显示一条感谢消息。我们想要异步的提交表单，所以使用了 `@submit.prevent` 以避免默认动作，也就是直接刷新页面。

现在添加提交逻辑：

```html
<script>
  export default {
    name: "FormSubmitter",

    data() {
      return {
        username: '',
        submitted: false
      }
    },

    methods: {
      handleSubmit() {
        this.submitted = true
      }
    }
  }
</script>
```

太简单了，我们只是在表单提交时把 `submitted` 设置为 `true`，继而包含提示信息的 `<div>` 显示出来而已。

## 编写测试

让我们来看看测试。我们将该测试标记为 `async` -- 读下去看看是为什么吧。

```js
import { shallowMount } from "@vue/test-utils"
import FormSubmitter from "@/components/FormSubmitter.vue"

describe("FormSubmitter", () => {
  it("reveals a notification when submitted", async () => {
    const wrapper = shallowMount(FormSubmitter)

    wrapper.find("[data-username]").setValue("alice")
    wrapper.find("form").trigger("submit.prevent")
    await wrapper.vm.$nextTick()

    expect(wrapper.find(".message").text())
      .toBe("Thank you for your submission, alice.")
  })
})
```

这个测试相当地具有自解释特性了。我们 `shallowMount` 了组件，设置了 username 并使用了 `vue-test-utils` 提供的 `trigger` 方法以简化用户输入。`trigger` 对自定义事件起作用，也包括使用了修饰符的事件，如 `submit.prevent`、`keydown.enter` 等等。

注意在调用 `trigger` 之后，我们写了 `await wrapper.vm.$nextTick()`。这就是为什么我们要将测试标记为 `async`-- 这样才能使用 `await`。从 `vue-test-utils` beta 28 起，你需要调用 `nextTick` 以确保 Vue 的反应式系统更新 DOM。有些时候你不调用 `nextTick` 也能侥幸成功，但如果你的组件开始变得复杂，就有可能遇到竞态条件从而让断言在 Vue 更新好 DOM 之前运行。更多的请读读官方文档 [vue-test-utils documentation](https://vue-test-utils.vuejs.org/guides/#updates-applied-by-vue)。

以上测试同样遵循了单元测试的三个步骤：

1. 安排（Arrange）：为测试做好设置。在我们的用例中，是渲染了组件
2. 行动（Act）：对系统执行操作
3. 断言（Assert）：确保真实的结果匹配你的期望

在上面的测试中我们将每个步骤以一个空行隔开，从而让测试更易读。

用 `yarn test:unit` 运行测试。测试将会通过。

触发很简单 -- 使用 `find` 取得你想要模拟一些输入的元素，并用事件名和任何修饰符调用 `trigger` 即可。

## 一个真实的例子

表单通常被提交到某些端点。我们来看看如何测试有着一个不同的 `handleSubmit` 实现的的组件。一种通常的实践是为你的 HTTP 库设置一个 `Vue.prototype.$http` 的别名。这使得我们要发起一次 ajax 只需调用 `this.$http.get(...)` 就行了。关于这种实践的更多可以参阅 [这里](https://vuejs.org/v2/cookbook/adding-instance-properties.html)。 

常用的 HTTP 库是 `axios`，一个流行的 HTTP 客户端。在本例中，我们的 `handleSubmit` 看起来可能会是这样的：

```js
handleSubmitAsync() {
  return this.$http.get("/api/v1/register", { username: this.username })
    .then(() => {
      // show success message, etc
    })
    .catch(() => {
      // handle error
    })
}
```

在对应的测试用例中，用到的一项技术是 _mock_ 掉 `this.$http` 以创建符合期望的测试环境。可以阅读 `mocks` 加载选项的 [文档](https://vue-test-utils.vuejs.org/api/options.html#mocks) 了解更多。让我们看看 `http.get` 方法的一种 mock 实现：

```js
let url = ''
let data = ''

const mockHttp = {
  get: (_url, _data) => {
    return new Promise((resolve, reject) => {
      url = _url
      data = _data
      resolve()
    })
  }
}
```

这里发生了一些有意思的事情：

- 我们创建了一个 `url` 变量和一个 `data` 变量以存储 `url` 和 `data` 并把它们传递给 `$http.get`。这对于断言请求以正确的 payload 命中了正确的端点是很有用的。
- 在复制了 `url` 和 `data` 参数之后，我们立即 resolve 了 Promise，以模拟一次成功的 API 响应。

在测试之前，先看看新的 `handleSubmitAsync` 函数：

```js
methods: {
  handleSubmitAsync() {
    return this.$http.get("/api/v1/register", { username: this.username })
      .then(() => {
        this.submitted = true
      })
      .catch((e) => {
        throw Error("Something went wrong", e)
      })
  }
}
```

同时，更新使用了新版本 `handleSubmitAsync` 函数的 `<template>` ：

```html
<template>
  <div>
    <form @submit.prevent="handleSubmitAsync">
      <input v-model="username" data-username>
      <input type="submit">
    </form>

  <!-- ... -->
  </div>
</template>
```

现在只剩下测试了。

## mock 一个 ajax 调用

首先在头部包含 mock 版本的 `this.$http`，在 `describe` 块之前：

```js
let url = ''
let data = ''

const mockHttp = {
  get: (_url, _data) => {
    return new Promise((resolve, reject) => {
      url = _url
      data = _data
      resolve()
    })
  }
}
```

添加测试，将 mock 的 `$http` 传入 `mocks` 加载选项：

```js
it("reveals a notification when submitted", () => {
  const wrapper = shallowMount(FormSubmitter, {
    mocks: {
      $http: mockHttp
    }
  })

  wrapper.find("[data-username]").setValue("alice")
  wrapper.find("form").trigger("submit.prevent")

  expect(wrapper.find(".message").text())
    .toBe("Thank you for your submission, alice.")
})
```

现在，不用管 `Vue.prototype.$http` 代表的是哪种真实的 HTTP 库，用到的都将是 mock 版本。这是很好的 -- 我们可以控制测试环境并取得一致的结果。

运行 `yarn test:unit` 实际上将产生报错信息：

```sh
FAIL  tests/unit/FormSubmitter.spec.js
  ● FormSubmitter › reveals a notification when submitted

    [vue-test-utils]: find did not return .message, cannot call text() on empty Wrapper
```

所发生的正是测试 _早于_ 由 `mockHttp` 返回的 promise 完成了。我们可以这样将测试变为异步的：

```js
it("reveals a notification when submitted", async () => {
  // ...
})
```

只是这样的话，测试仍将早于 promise 完成。一种解决办法是使用 [flush-promises](https://www.npmjs.com/package/flush-promises)，一个立即 resolve 所有 pending 中的 promise 的简单 Node.js 模块。用 `yarn add flush-promises` 安装它，并更新测试如下：

```js
import flushPromises from "flush-promises"
// ...

it("reveals a notification when submitted", async () => {
  const wrapper = shallowMount(FormSubmitter, {
    mocks: {
      $http: mockHttp
    }
  })

  wrapper.find("[data-username]").setValue("alice")
  wrapper.find("form").trigger("submit.prevent")

  await flushPromises()

  expect(wrapper.find(".message").text())
    .toBe("Thank you for your submission, alice.")
})
```

使用 `flush-promises` 有个好的副作用，那就是能确保包括 `nextTick` 在内的所有 promises 都被 resolve，并且 Vue 也会更新 DOM。

现在测试通过了。`flush-promises` 的源码不超过 10 行，如果你对 Node.js 有兴趣那是值得一读并理解其工作原理的。（译注：主要就是利用 setImmediate 或 setTimeout 触发微任务队列的清空；个人觉得 [这里](https://github.com/tonylua/vue-testing-handbook/blob/master/src/zh-CN/vuex-actions.md#%E6%B5%8B%E8%AF%95-api-error) 的做法可能更好一些）

我们同样要确保端点和 payload 的正确。向测试中添加两句断言：

```js
// ...
expect(url).toBe("/api/v1/register")
expect(data).toEqual({ username: "alice" })
```

测试仍然通过了。

## 总计

在本章中，我们看到了如何：

- 在事件上使用 `trigger`，包括使用了诸如 `prevent` 修饰符的那些
- 使用 `setValue` 设置一个使用了 `v-model` 的 `<input>` 的值 
- 使用三步法编写单元测试
- 使用 `mocks` 加载选项 mock 掉 `Vue.prototype` 上的方法
- 如何用 `flush-promises` 立即 resolve 所有 promises

本页中所描述的测试源码可以在 [这里](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/FormSubmitter.spec.js) 找到。
