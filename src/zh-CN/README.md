## 这本指南是什么？

欢迎来到 Vue.js 测试指南！

这是一系列关于如何测试 Vue 组件的短小而目标明确的示例。它使用了测试 Vue 组件的官方库 [`vue-test-utils`](https://github.com/vuejs/vue-test-utils)，以及一个现代测试框架 [Jest](https://jestjs.io/)。本书不但涵盖了 `vue-test-utils` 的 API，而且也是测试组件的最佳实践。

每个章节都是互相独立的。我们从通过 `vue-cli` 设置一个环境并编写一个简单的测试起步。而后，讨论了两种渲染一个组件的方式 -- `mount` 和 `shallowMount`。其区别将被演示和说明。

从那时起，我们覆盖了如何应对测试组件时出现的各种情景，诸如：

- 接受 props
- 使用 computed 属性
- 渲染其他组件
- emit 事件

等等。其后我们继续向更多有趣的场景进发，比如：

- 测试 Vuex (在组件中，并且是独立的) 的最佳实践
- 测试 Vue router
- 测试包含的第三方组件

我们也将探索如何使用 Jest API 让我们的测试更健壮，如：

- mocking API 响应
- 模块上的 mocking 和 spying
- 使用 snapshots

## 延伸阅读

更多有用的资源包括：

- [Official docs](https://vue-test-utils.vuejs.org/)
- [Book](https://www.manning.com/books/testing-vue-js-applications) 另一位作者写的 `vue-test-utils`
- [This awesome course on VueSchool](https://vueschool.io/courses/learn-how-to-test-vuejs-components?friend=vth) 由多位 Vue 核心贡献者编写
