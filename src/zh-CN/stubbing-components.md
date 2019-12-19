## Stubbing components

可以在 [这里](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/ParentWithAPICallChild.spec.js) 找到本页中描述的测试.

## 为什么用 stub ？

当编写测试时，我们经常会想要 _stub_ 掉代码中那些我们不感兴趣的部分。一个 stub 就是简单的一段替身代码。比方说你正在为 `<UserContainer>` 组件编写一个测试。该组件看起来就像这样：

```html
<UserContainer>
  <UsersDisplay />
</UserContainer>
```

`<UsersDisplay>` 有一个 `created` 像这样的生命周期方法：

```js
created() {
  axios.get("/users")
}
```

我们想编写一个测试来断言 `<UsersDisplay>` 已经被渲染了。 

`axios` 被用来在 `created` 钩子中生成一个指向外部服务的 ajax 请求。这意味着当你执行 `mount(UserContainer)` 时，`<UsersDisplay>` 也加载了，并且 `created` 启动了一个 ajax 请求。因为这是一个单元测试，我们只关心 `<UserContainer>` 是否正确的渲染了 `<UsersDisplay>` -- 至于检验 ajax 请求在适当的点被触发，等等，则是 `<UsersDisplay>` 的职责了，应该在 `<UsersDisplay>` 的测试文件中进行。

一种防止 `<UsersDisplay>` 启动 ajax 请求途径是将该组件 _stubbing(译注：插入替换的桩代码)_ 掉。让我们编写自己组件并测试，以获得关于使用 stubs 不同方式和优点的更好理解。

## 创建组件

这个例子将使用两个组件。第一个是 `ParentWithAPICallChild`，用来简单地渲染另一个组件：

```html
<template>
  <ComponentWithAsyncCall />
</template>

<script>
import ComponentWithAsyncCall from "./ComponentWithAsyncCall.vue"

export default {
  name: "ParentWithAPICallChild",

  components: {
    ComponentWithAsyncCall
  }
}
</script>
```

`<ParentWithAPICallChild>` 是个简单的组件。其唯一的职责就是渲染 `<ComponentWithAsyncCall>`。`<ComponentWithAsyncCall>`，如其名字所暗示的，使用 `axios` http 客户端发起一个 ajax 调用：

```html
<template>
  <div></div>
</template>

<script>
import axios from "axios"

export default {
  name: "ComponentWithAsyncCall",
  
  created() {
    this.makeApiCall()
  },
  
  methods: {
    async makeApiCall() {
      console.log("Making api call")
      await axios.get("https://jsonplaceholder.typicode.com/posts/1")
    }
  }
}
</script>
```

`<ComponentWithAsyncCall>` 在 `created` 生命周期钩子中调用了 `makeApiCall`。

## 使用 `mount` 编写一个测试

让我们从编写一个验证 `<ComponentWithAsyncCall>` 是否被渲染的测试开始：

```js
import { shallowMount, mount } from '@vue/test-utils'
import ParentWithAPICallChild from '@/components/ParentWithAPICallChild.vue'
import ComponentWithAsyncCall from '@/components/ComponentWithAsyncCall.vue'

describe('ParentWithAPICallChild.vue', () => {
  it('renders with mount and does initialize API call', () => {
    const wrapper = mount(ParentWithAPICallChild)

    expect(wrapper.find(ComponentWithAsyncCall).exists()).toBe(true)
  })
})
```

运行 `yarn test:unit` 会产生：

```
PASS  tests/unit/ParentWithAPICallChild.spec.js

console.log src/components/ComponentWithAsyncCall.vue:17
  Making api call
```

测试通过了 -- 这很棒！但是，我们可以做得更好。注意测试输出中的 `console.log` -- 这来自 `makeApiCall` 方法。理想情况下我们不想在单元测试中发起对外部服务的调用，特别是当其从一个并非当前主要目标的组件中发起时。我们可以使用 `stubs` 加载选项，在 `vue-test-utils` 文档的 [这个章节](https://vue-test-utils.vuejs.org/api/options.html#stubs) 中有所描述。

## 使用 `stubs` 去 stub `<ComponentWithAsyncCall>`

让我们更新测试，这次 stubbing 掉 `<ComponentWithAsyncCall>`：

```js
it('renders with mount and does initialize API call', () => {
  const wrapper = mount(ParentWithAPICallChild, {
    stubs: {
      ComponentWithAsyncCall: true
    }
  })

  expect(wrapper.find(ComponentWithAsyncCall).exists()).toBe(true)
})
```

运行 `yarn test:unit` 时该测试将通过，而 `console.log` 也无影无踪了。这是因为向 `stubs` 传入 `[component]: true` 后用一个 _stub_ 替换了原始的组件。外部的接口也照旧（我们依然可以用 `find` 选取，因为 `find` 内部使用的 `name` 属性仍旧相同）。诸如 `makeApiCall` 的内部方法，则被不做任何事情的伪造方法替代了 -- 它们被 “stubbed out” 了。

也可以指定 stub 所用的标记语言，如果你乐意：

```js
const wrapper = mount(ParentWithAPICallChild, {
  stubs: {
    ComponentWithAsyncCall: "<div class='stub'></div>"
  }
})
```

## `shallowMount` 的自动化 stubbing

不同于使用 `mount` 并手动 stub 掉 `<ComponentWithAsyncCall>`，我们可以简单的使用 `shallowMount`，它默认会自动 stub 掉任何其他组件。用了 `shallowMount` 的测试看起来是这个样子的：

```js
it('renders with shallowMount and does not initialize API call', () => {
  const wrapper = shallowMount(ParentWithAPICallChild)

  expect(wrapper.find(ComponentWithAsyncCall).exists()).toBe(true)
})
```

运行 `yarn test:unit` 没有显示任何 `console.log`，并且测试也通过了。`shallowMount` 自动 stub 了 `<ComponentWithAsyncCall>`。对于有若干子组件、可能也会触发很多诸如 `created` 或 `mounted` 生命周期钩子行为的组件，使用 `shallowMount` 测试会很有用。我倾向于默认使用 `shallowMount`，触发有好使用 `mount` 的理由。这取决于你的用例，以及你在测试什么。

## 总结

- `stubs` 在屏蔽子组件中与当前单元测试无关行为方面很有用
- `shallowMount` 默认就 stub 掉了子组件
- 可以向默认 stub 中传入 `true` 或自定义的实现

可以在 [这里](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/ParentWithAPICallChild.spec.js) 找到本页中描述的测试.