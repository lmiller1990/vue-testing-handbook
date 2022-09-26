## The Composition API

Vue 3 将引入一个新的 API 用以创建组件 -- 即 [Composition API](https://vue-composition-api-rfc.netlify.com/#basic-example)。为了让开发者们更早的尝试它并取得反馈，Vue 团队释出了一个让我们能在 Vue 2 中使用的插件。你可以在 [这里](https://github.com/vuejs/composition-api) 找到它。

测试一个用 Composition API 搭建的组件应该和测试一个标准组件没有分别，因为我们不测试其实现，而只是测试输出（组件 *是什么*，而非 *如何为之*）。这篇文章将用一个简单的例子，展示使用了 Composition API 的 Vue 2 组件，其测试策略和处理其他组件时的何其相同。

在本页中所描述的测试源码可以在 [这里](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/CompositionApi.spec.js) 找到。

## 组件

以下代码或多或少地可以算作 Composition API 界的 “Hello, World” 了。如果你有什么不懂的， [读一下这个 RFC](https://vue-composition-api-rfc.netlify.com/) ，或 google 一下；总有很多可用的 Composition API 相关资源的。

```html
<template>
  <div>
    <div class="message">{{ uppercasedMessage }}</div>
    <div class="count">
      Count: {{ state.count }}
    </div>
    <button @click="increment">Increment</button>
  </div>
</template>

<script>
import Vue from 'vue'
import VueCompositionApi from '@vue/composition-api'

Vue.use(VueCompositionApi)

import {
  reactive,
  computed
} from '@vue/composition-api'

export default {
  name: 'CompositionApi',

  props: {
    message: {
      type: String
    }
  },

  setup(props) {
    const state = reactive({
      count: 0
    })

    const increment = () => {
      state.count += 1
    }

    return {
      state,
      increment,
      uppercasedMessage: computed(() => props.message.toUpperCase())
    }
  }
}
</script>
```

此处我们将需要测试两件事情：

1.  点击 increment 按钮会将 `state.count` 加 1 吗？
2.  props 中传入的 message 是否被正确地渲染了（转为大写）？

## 测试 Props 中传入的 Message

测试 message 被妥当地渲染是小事一桩。我们只须使用 `propsData` 设置属性值即可，正如 [这里](/components-with-props.html) 所描述的。

```js
import { shallowMount } from "@vue/test-utils"

import CompositionApi from "@/components/CompositionApi.vue"

describe("CompositionApi", () => {
  it("renders a message", () => {
    const wrapper = shallowMount(CompositionApi, {
      propsData: {
        message: "Testing the composition API"
      }
    })

    expect(wrapper.find(".message").text()).toBe("TESTING THE COMPOSITION API")
  })
})
```

不错所料，这非常简单 -- 尽管我们没用组件方式，仍可以使用同样的 API 和同样的测试策略。你应该能够整个改变实现，而不用碰测试代码才对。记住要基于给定的输入（属性、触发的事件）测试输出（通常是渲染过的 HTML），而非实现。

## 测试按钮单击

写一个测试去确保单击按钮后增加 `state.count` 同样的简单。注意该测试被标记为 `async`；关于为何需要这样做可以参阅 [模拟用户输入](simulating-user-input.html#writing-the-test) 。

```js
import { shallowMount } from "@vue/test-utils"

import CompositionApi from "@/components/CompositionApi.vue"

describe("CompositionApi", () => {
  it("increments a count when button is clicked", async () => {
    const wrapper = shallowMount(CompositionApi, {
      propsData: { message: '' }
    })

    wrapper.find('button').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find(".count").text()).toBe("Count: 1")
  })
})
```

不厌其烦地再解说一次 -- 我们 `trigger` 了单击事件，并断言渲染过的 `count` 增加了。

## 总结

本文演示了如何测试一个使用了 Composition API 的组件和测试一个传统的 options API 组件时是何其相同的。无论是想法还是概念都一样。要学习的要点在于，当编写测试时，基于输入和输出做出断言。

应该有可能在无需修改单元测试的前提下，使用 Composition API 重构任何传统的 Vue 组件。如果你发现自己在重构时需要更改测试，很可能就是之前测试了 *具体实现*，而非输出。

虽然是个动人的新特性，但 Composition API 完全是锦上添花的，所以不需要立刻去用它，但是无论你如何抉择，记住一个好的单元测试只断言组件的最终状态，而不用考虑其实现细节。
