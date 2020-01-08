## 测试 getters

由于 getters 就是普通的 JavaScript 函数，所以单独地测试它们非常容易。所用技术类似于测试 mutations 或 actions，更多信息查看 [这里](https://lmiller1990.github.io/vue-testing-handbook/vuex-mutations.html)。 

本页中描述的测试源码可以在 [这里](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/getters.spec.js) 找到。

我们考虑一个用两个 getters 操作一个 store 的案例，看起来是这样的：

```js
const state = {
  dogs: [
    { name: "lucky", breed: "poodle", age: 1 },
    { name: "pochy", breed: "dalmatian", age: 2 },
    { name: "blackie", breed: "poodle", age: 4 }
  ]
}
```

对于 getters 我们将测试：

1. `poodles`: 取得所有 `poodles`
2. `poodlesByAge`: 取得所有 `poodles`，并接受一个年龄参数

## 创建 getters

首先，创建 getters。

```js
export default {
  poodles: (state) => {
    return state.dogs.filter(dog => dog.breed === "poodle")
  },

  poodlesByAge: (state, getters) => (age) => {
    return getters.poodles.filter(dog => dog.age === age)
  }
}
```

并没有什么特别令人兴奋的 -- 记住 getter 可以接受其他的 getters 作为第二个参数。因为我们已经有一个 `poodles` getter 了，可以在 `poodlesByAge` 中复用它。通过在 `poodlesByAge` 返回一个接受参数的函数，我们可以向 getters 中传入参数。`poodlesByAge` getter 用法是这样的：

```js
computed: {
  puppies() {
    return this.$store.getters.poodlesByAge(1)
  }
}
```

让我们从测试 `poodles` 开始吧。

## 编写测试

鉴于一个 getter 只是一个接收一个 `state` 对象作为首个参数的 JavaScript 函数，所以测试起来非常简单。我将把测试写在 `getters.spec.js` 文件中，代码如下：

```js
import getters from "../../src/store/getters.js"

const dogs = [
  { name: "lucky", breed: "poodle", age: 1 },
  { name: "pochy", breed: "dalmatian", age: 2 },
  { name: "blackie", breed: "poodle", age: 4 }
]
const state = { dogs }

describe("poodles", () => {
  it("returns poodles", () => {
    const actual = getters.poodles(state)

    expect(actual).toEqual([ dogs[0], dogs[2] ])
  })
})
```

Vuex 会自动将 `state` 传入 getter。因为我们是单独地测试 getters，所以还得手动传入 `state`。除此之外，我们就是在测试一个普通的 JavaScript 函数。

`poodlesByAge` 则更有趣一点了。传入一个 getter 的第二个参数是其他 `getters`。我们正在测试的是 `poodlesByAge`，所以我们不想将 `poodles` 的实现牵扯进来。我们通过 stub 掉 `getters.poodles` 取而代之。这将给我们对测试更细粒度的控制。

```js
describe("poodlesByAge", () => {
  it("returns poodles by age", () => {
    const poodles = [ dogs[0], dogs[2] ]
    const actual = getters.poodlesByAge(state, { poodles })(1)

    expect(actual).toEqual([ dogs[0] ])
  })
})
```

不同于向 getter 传入真实的 `poodles`（译注：刚刚测试过的另一个 getter），我们传入的是一个它可能返回的结果。因为之前写过一个测试了，所以我们知道它是工作正常的。这使得我们把测试逻辑单独聚焦于 `poodlesByAge`。

`async` 的 getters 也是可能的。它们可以通过和测试 `async` actions 的相同技术被测试，参见 [这里](https://lmiller1990.github.io/vue-testing-handbook/vuex-actions.html)。

## 总结

- `getters` 只是普通的 JavaScript 函数。
- 当单独地测试 `getters` 时，你需要手动传入 state
- 如果一个 getter 使用了其他 getters，你应该用符合期望的返回结果 stub 掉后者。这将给我们对测试更细粒度的控制，并让你聚焦于测试中的 getter。

本页中描述的测试源码可以在 [这里](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/getters.spec.js) 找到。
