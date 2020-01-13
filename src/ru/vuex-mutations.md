## Тестирование мутаций

Тестировать мутации в изоляции достаточно просто, так как это обычные JavaScript функции. На этой странице обсудим тестирование мутаций в изоляции. Если вы хотите тестировать мутации в контексте компонента, то смотрите [здесь](https://lmiller1990.github.io/vue-testing-handbook/ru/vuex-in-components-mutations-and-actions.html).

Тест для последующего примера можно найти [тут](https://github.com/lmiller1990/vue-testing-handbook/blob/master/demo-app/tests/unit/mutations.spec.js).

## Создание мутации

Мутации следует паттерну функции, которая записывает значение свойства. Получаем какую-либо информацию, возможно обрабатываем её, затем складываем в хранилище. Вот обёртка для мутации `ADD_POST`. Она будет получать объект `post` как нагрузку и 
добавлять `post.id` в `state.postIds`. Она также будет добавлять объект `post` в `state.posts`, где ключом является `post.id`. Это обычный паттерн, применяемый в приложениях с Vuex.

Мы сделаем это по TDD. Начало мутации выглядит следующим образом:

```js
export default {
  SET_POST(state, { post }) {

  }
}
```

Давайте напишем тест и пусть ошибки подсказывают нам, что делать дальше:

```js
import mutations from "@/store/mutations.js"

describe("SET_POST", () => {
  it("добавляет пост в хранилище", () => {
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

Запуск `yarn test:unit` выдаст нам следующую ошибку:

```bash
FAIL  tests/unit/mutations.spec.js
● SET_POST › добавляет пост в хранилище

  expect(received).toEqual(expected)

  Expected value to equal:
    {"postIds": [1], "posts": {"1": {"id": 1, "title": "Post"}}}
  Received:
    {"postIds": [], "posts": {}}
```

Давайте начнём с добавления `post.id` в `state.postIds`:

```js
export default {
  SET_POST(state, { post }) {
    state.postIds.push(post.id)
  }
}
```

Теперь `yarn test:unit` выводит:

```
Expected value to equal:
  {"postIds": [1], "posts": {"1": {"id": 1, "title": "Post"}}}
Received:
  {"postIds": [1], "posts": {}}
```
`postIds` выглядит отлично. Теперь нам нужно просто добавить пост в `state.posts`. При сегодняшнем состоянии системы Vue-реактивности, мы не может просто написать `post[post.id] = post`, чтобы добавить пост. Подробнее можно почитать [здесь](https://ru.vuejs.org/v2/guide/reactivity.html#%D0%9E%D1%81%D0%BE%D0%B1%D0%B5%D0%BD%D0%BD%D0%BE%D1%81%D1%82%D0%B8-%D0%BE%D1%82%D1%81%D0%BB%D0%B5%D0%B6%D0%B8%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F-%D0%B8%D0%B7%D0%BC%D0%B5%D0%BD%D0%B5%D0%BD%D0%B8%D0%B9). По сути, вам нужно создать новый объект, используя `Object.assign` или оператор `...`. Мы используем оператор `...`, чтобы присвоить пост в `state.posts`.

```js
export default {
  SET_POST(state, { post }) {
    state.postIds.push(post.id)
    state.posts = { ...state.posts, [post.id]: post }
  }
}
```

Теперь тест проходит проверку!

## Заключение

Тестирование Vuex мутации не требует ничего специфичного для Vue или Vuex, так как это обычные JavaScript функции. Просто импортируйте их и тестируйте, если необходимо. Важно помнить единственную вещь – как работает система реактивности Vue, которая также применяется и к Vuex. Подробнее о системе реактивности и ограничениях можно почитать [здесь](https://ru.vuejs.org/v2/guide/reactivity.html#%D0%9E%D1%81%D0%BE%D0%B1%D0%B5%D0%BD%D0%BD%D0%BE%D1%81%D1%82%D0%B8-%D0%BE%D1%82%D1%81%D0%BB%D0%B5%D0%B6%D0%B8%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F-%D0%B8%D0%B7%D0%BC%D0%B5%D0%BD%D0%B5%D0%BD%D0%B8%D0%B9).

На этой странице обсудили:

- что Vuex мутация – это обычные JavaScript функции
- что мутации могут и должны тестироваться в изоляции от основного приложения Vue

Тест для примера выше можно найти [тут](https://github.com/lmiller1990/vue-testing-handbook/blob/master/demo-app/tests/unit/mutations.spec.js).
