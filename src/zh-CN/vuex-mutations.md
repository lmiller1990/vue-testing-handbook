## 测试 Mutations

由于 mutations 就是普通的 JavaScript 函数，所以单独地测试它们非常容易，在本页中讨论了这点。如果你想在组件 commit 一个 mutation 的上下文中测试 mutations，请查看 [这里](https://lmiller1990.github.io/vue-testing-handbook/vuex-in-components-mutations-and-actions.html) 。

下面例子中用到的测试可以在 [这里](https://github.com/lmiller1990/vue-testing-handbook/blob/master/demo-app/tests/unit/mutations.spec.js) 找到。

## 创建 mutation

mutations 易于遵循一套模式：取得一些数据，可能进行一些处理，然后将数据赋值给 state。比如一个 `ADD_POST` mutation 的概述如下：一旦被实现，它将从 payload 中获取一个 `post` 对象，并将 `post.id` 添加到 `state.postIds` 中；它也会将那个 post 对象以 `post.id` 为 key 添加到 `state.posts` 对象中。这即是在应用中使用 Vuex 的一个通常的模式。

我们将使用 TDD 进行开发。mutation 是这样开头的：

```js
export default {
  SET_POST(state, { post }) {

  }
}
```

让我们开始写测试，并让报错信息指引我们的开发：

```js
import mutations from "@/store/mutations.js"

describe("SET_POST", () => {
  it("adds a post to the state", () => {
    const post = { id: 1, title: "Post" }
    const state = {
      postIds: [],
      posts: {}
    }

    mutations.SET_POST(state, { post })

    expect(state).toEqual({
      postIds: [1],
      posts: { "1": post }
    })
  })
})
```

以 `yarn test:unit` 运行测试将产生以下错误信息：

```
FAIL  tests/unit/mutations.spec.js
● SET_POST › adds a post to the state

  expect(received).toEqual(expected)

  Expected value to equal:
    {"postIds": [1], "posts": {"1": {"id": 1, "title": "Post"}}}
  Received:
    {"postIds": [], "posts": {}}
```

让我们从将 `post.id` 加入 `state.postIds` 开始：

```js
export default {
  SET_POST(state, { post }) {
    state.postIds.push(post.id)
  }
}
```

现在 `yarn test:unit` 会产生:

```
Expected value to equal:
  {"postIds": [1], "posts": {"1": {"id": 1, "title": "Post"}}}
Received:
  {"postIds": [1], "posts": {}}
```

`postIds` 看起来挺好了。现在我们只需要将 post 加入 `state.posts`。限于 Vue 反应式系统的工作方式我们无法简单地写成 `post[post.id] = post` 来添加 post。更多细节可以在 [这里](https://vuejs.org/v2/guide/reactivity.html#Change-Detection-Caveats)找到。基本上，你需要使用 `Object.assign` 或 `...` 操作符创建一个新的对象。此处我们将使用 `...` 操作符将 post 赋值到 `state.posts`：

```js
export default {
  SET_POST(state, { post }) {
    state.postIds.push(post.id)
    state.posts = { ...state.posts, [post.id]: post }
  }
}
```

现在测试都通过了！

## 总结

测试 Vuex mutations 不需要什么特殊的 Vue 或 Vuex 功能，因为它们都是普通的 JavaScript 函数。根据需要简单地引入它们并测试就行了。唯一需要留意的事情是 Vue 的反应式注意事项，对于 Vuex 也是一样的。更多关于反应式系统和一般注意事项可以在 [这里](https://vuejs.org/v2/guide/reactivity.html#Change-Detection-Caveats) 读到。

本页讨论了：

- Vuex mutations 是普通的 JavaScript 函数
- mutations 可以、也应该，被区别于主 Vue 应用而单独地测试

以上例子中使用的测试可以在 [这里](https://github.com/lmiller1990/vue-testing-handbook/blob/master/demo-app/tests/unit/mutations.spec.js) 找到。
