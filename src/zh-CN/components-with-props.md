## 用 propsData 设置 props

`propsData` 对于 `mount` 和 `shallowMount` 都可以使用。它经常被用于测试从父组件中接受属性（props）的组件。

`propsData` 会以下面的形式被传入 `shallowMount` 或 `mount` 的第二个参数中：

```js
const wrapper = shallowMount(Foo, {
  propsData: {
    foo: 'bar'
  }
})
```

## 创建组件

创建一个简单的 `<SubmitButton>` 组件，有着 `msg` 和 `isAdmin` 两种 props。取决于 `isAdmin` 属性的值，该组件将以如下两种状态中的一种包含一个 `<span>`：

* `Not Authorized`：若 `isAdmin` 为 false (或者没有传入到 props 中)
* `Admin Privileges`：若 `isAdmin` 为 true

```html
<template>
  <div>
    <span v-if="isAdmin">Admin Privileges</span>
    <span v-else>Not Authorized</span>
    <button>
      {{ msg }}
    </button>
  </div>
</template>

<script>
export default {
  name: "SubmitButton",

  props: {
    msg: {
      type: String,
      required: true
    },
    isAdmin: {
      type: Boolean,
      default: false
    }
  }
}
</script>
```

## 第一个测试

我们将对用户没有 admin 权限时的 msg 做一个断言：

```js
import { shallowMount } from '@vue/test-utils'
import SubmitButton from '@/components/SubmitButton.vue'

describe('SubmitButton.vue', () => {
  it("displays a non authorized message", () => {
    const msg = "submit"
    const wrapper = shallowMount(SubmitButton,{
      propsData: {
        msg: msg
      }
    })

    console.log(wrapper.html())

    expect(wrapper.find("span").text()).toBe("Not Authorized")
    expect(wrapper.find("button").text()).toBe("submit")
  })
})
```

用 `yarn test:unit` 运行测试。结果是：

```
PASS  tests/unit/SubmitButton.spec.js
  SubmitButton.vue
    ✓ displays a non authorized message (15ms)
```

`console.log(wrapper.html())` 的结果也被打印出来了：

```html
<div>
  <span>Not Authorized</span>
  <button>
    submit
  </button>
</div>
```

可见 `msg` prop 已经被处理并且结果也渲染正常。

## 第二个测试

让我们对另一种可能的状态作出断言。当 `isAdmin` 为 `true` 时：

```js
import { shallowMount } from '@vue/test-utils'
import SubmitButton from '@/components/SubmitButton.vue'

describe('SubmitButton.vue', () => {
  it('displays a admin privileges message', () => {
    const msg = "submit"
    const isAdmin = true
    const wrapper = shallowMount(SubmitButton,{
      propsData: {
        msg,
        isAdmin
      }
    })

    console.log(wrapper.html())
    
    expect(wrapper.find("span").text()).toBe("Admin Privileges")
    expect(wrapper.find("button").text()).toBe("submit")
  })
})
```

用 `yarn test:unit` 运行测试并检查结果：

```shell
PASS  tests/unit/SubmitButton.spec.js
  SubmitButton.vue
    ✓ displays a admin privileges message (4ms)
```

同样用 `console.log(wrapper.html())` 输出了结果：

```html
<div>
  <span>Admin Privileges</span>
  <button>
    submit
  </button>
</div>
```

可见 `isAdmin` 被用来渲染了正确的 `<span>` 元素。

## 重构测试

让我们遵循 "Don't Repeat Yourself" 的 DRY 原则来重构测试。因为所有测试都通过了，我们就能放心大胆地重构了。只要重构后测试仍然通过，就能确保我们没有破坏任何东西。

### 用工厂函数重构

在几个测试中我们都调用了 `shallowMount` 并随后传入一个相似的 `propsData` 对象。我们可以讲这件事重构为一个工厂函数。一个工厂函数只是一个返回单个对象的简单函数 -- 它 _制造_ 对象，这就是其名为 “工厂” 的原因。

```js
const msg = "submit"
const factory = (propsData) => {
  return shallowMount(SubmitButton, {
    propsData: {
      msg,
      ...propsData
    }
  })
}
```

以上就是一个将会 `shallowMount` 一个 `SubmitButton` 组件的函数。可以传入任何属性以改变 `factory` 的首个参数。让我们用这个工厂函数 DRY 测试起来。

```js
describe("SubmitButton", () => {
  describe("has admin privileges", ()=> {
    it("renders a message", () => {
      const wrapper = factory()

      expect(wrapper.find("span").text()).toBe("Not Authorized")
      expect(wrapper.find("button").text()).toBe("submit")
    })
  })

  describe("does not have admin privileges", ()=> {
    it("renders a message", () => {
      const wrapper = factory({ isAdmin: true })

      expect(wrapper.find("span").text()).toBe("Admin Privileges")
      expect(wrapper.find("button").text()).toBe("submit")
    })
  })
})
```

再次运行测试。所有事情仍然通过。

```sh
PASS  tests/unit/SubmitButton.spec.js
 SubmitButton
   has admin privileges
     ✓ renders a message (26ms)
   does not have admin privileges
     ✓ renders a message (3ms)
```

正因为我们有了良好的测试套件，所以就可以容易而放心的重构了。

## 总结

- 通过在加载一个组件时传递 `propsData`，就可以设置 `props` 以用于测试
- 工厂函数可以被用来 DRY 你的测试
- 除了 `propsData`，你也可以查阅 [`setProps`](https://vue-test-utils.vuejs.org/api/wrapper-array/#setprops-props) 以在测试中设置属性值
