## 测试 Vuex

下面几篇将会讨论测试 Vuex。

## 测试 Vuex 的两方面

通常来说组件会在以下方面和 Vuex 发生交互：

1. commit 一个 mutation
2. dispatch 一个 action
3. 通过 `$store.state` 或 getters 访问 state

这些测试都是基于 Vuex store 的当前 state 来断言组件行为是否正常的。它们并不需要知道  mutators、actions 或 getters 的实现。

store 所执行的任何逻辑，诸如 mutations 和 getters，都能被单独地测试。因为 Vuex stores 由普通 JavaScript 函数组成，所以它们易于被单元测试。

下一篇介绍了一些测试使用了 Vuex store 的组件、并确保它们按 store 的 state 产生正确行为的技术。其后的章节则讨论隔离地测试 Vuex。
