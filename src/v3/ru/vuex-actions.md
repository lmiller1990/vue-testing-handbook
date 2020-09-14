:::tip Это руководство было написано для Vue.js 3 и Vue Test Utils v2.
Версия для Vue.js 2 [здесь](/ru).
:::

## Тестирование действий

Тестировать действия в изоляции очень просто. Это очень похоже на тестирование мутаций в изоляции – смотрите [здесь](https://lmiller1990.github.io/vue-testing-handbook/ru/vuex-mutations.html) про тестирование мутаций. Тестирование диспетчеризации действий в контексте компонента обсуждалось [здесь](https://lmiller1990.github.io/vue-testing-handbook/ru/vuex-in-components-mutations-and-actions.html).

Исходный код для теста на этой странице можно найти [здесь](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app-vue-3/tests/unit/actions.spec.js).

## Создание действия

Мы напишем действие, которое следует обычному Vuex паттерну:

1. делаем асинхронный запрос к API
2. обрабатываем данные (опционально)
3. делаем `commit` мутации с результатом в виде нагрузки

Вот действие `authenticate`, которое отправляет имя пользователя и пароль к внешнему API, в котором проверяется совпадают ли они. Затем результат используется для обновления хранилища, путём выполнения мутации `SET_AUTHENTICATED` с результатом в виде нагрузки.

```js
import axios from "axios"

export default {
  async authenticate({ commit }, { username, password }) {
    const authenticated = await axios.post("/api/authenticate", {
      username, password
    })

    commit("SET_AUTHENTICATED", authenticated)
  }
}
```

Тест для действия должен проверять:

1. правильный ли endpoint API использовался?
2. правильная ли нагрузка для мутации?
3. правильная ли мутация была использована?

Давайте двигаться вперёд и напишем тест, пусть ошибки подсказывают нам что делать.

## Написание теста

```js
describe("Авторизация", () => {
  it("авторизует пользователя", async () => {
    const commit = jest.fn()
    const username = "alice"
    const password = "password"

    await actions.authenticate({ commit }, { username, password })

    expect(url).toBe("/api/authenticate")
    expect(body).toEqual({ username, password })
    expect(commit).toHaveBeenCalledWith(
      "SET_AUTHENTICATED", true)
  })
})
```

Так как `axios` асинхронный, нужно убедиться, что Jest дождётся окончания теста. Добавим `async` для функции и `await` для вызова `actions.authenticate`. В противном случае тест завершится до проверки `expect`, и мы получим тест, который всегда будет проходить проверку.

Запуск теста выше выдаст нам такую ошибку:

```bash
 FAIL  tests/unit/actions.spec.js
  ● Авторизация › авторизует пользователя

    SyntaxError: The string did not match the expected pattern.

      at XMLHttpRequest.open (node_modules/jsdom/lib/jsdom/living/xmlhttprequest.js:482:15)
      at dispatchXhrRequest (node_modules/axios/lib/adapters/xhr.js:45:13)
      at xhrAdapter (node_modules/axios/lib/adapters/xhr.js:12:10)
      at dispatchRequest (node_modules/axios/lib/core/dispatchRequest.js:59:10)
```

Это ошибка возникает где-то внутри `axios`. Мы делаем запрос к `/api...` и, так как мы запускаем тест в тестовом окружении, в котором даже нет сервера, получаем ошибку. Мы также не определили `url` или `body` – мы сделаем это, когда будем решать ошибку с `axios`.

Так как мы используем Jest, можно легко замокать вызов API, применяя `jest.mock`. Мы сделаем мок для `axios`, который даст нам больше контроля над его поведением. Jest предоставляет [моки для ES6 классов](https://jestjs.io/docs/ru/es6-class-mocks), которые идеально подходят для мока `axios`.

Мок для `axios` выглядит следующим образом:

```js
let url = ''
let body = {}

jest.mock("axios", () => ({
  post: (_url, _body) => { 
    return new Promise((resolve) => {
      url = _url
      body = _body
      resolve(true)
    })
  }
}))
```

Мы сохраняем `url` и `body` в переменные, чтобы мы могли проверить, что правильный endpoint получает правильную нагрузку. Так как мы не хотим использовать настоящий endpoint, мы немедленно выполняем промис, что симулирует успешный вызов API.


`yarn unit:pass` теперь выводит сообщение, что тест прошёл проверку!

## Тестирование ошибки API

Мы только протестировали случай, когда вызов API успешный. Важно тестировать все возможные случаи. Давайте напишем тест, в котором происходит ошибка. В этот раз, мы сначала напишем тест, а затем - реализацию.

Тест выглядит примерно так:

```js
it("ловит ошибки", async () => {
  mockError = true

  await expect(actions.authenticate({ commit: jest.fn() }, {}))
    .rejects.toThrow("Произошла ошибка API.")
})
```

Нам нужно найти способ заставить мок для `axios` сгенерировать ошибку. Вот для чего нужна переменная `mockError`. Обновим мок для `axios` вот так:

```js
let url = ''
let body = {}
let mockError = false

jest.mock("axios", () => ({
  post: (_url, _body) => { 
    return new Promise((resolve) => {
      if (mockError) 
        throw Error()

      url = _url
      body = _body
      resolve(true)
    })
  }
}))
```

Jest позволяет обращаться к переменной вне текущего лексического окружения ES6 класса только, если перед названием переменной стоит `mock`. Теперь мы можем с лёгкостью сделать `mockError = true` и `axios` сгенерирует ошибку.

Запуск теста выдаст нам такую ошибку:

```bash
FAIL  tests/unit/actions.spec.js
● Авторизация › ловит ошибки

  expect(function).toThrow(string)

  Expected the function to throw an error matching:
    "Произошла ошибка API."
  Instead, it threw:
    Mock error
```

Он успешно словил ошибку... но не ту которую мы хотели. Обновим `authenticate`, чтобы генерировать ошибку, которая ожидается в тесте: 

```js
export default {
  async authenticate({ commit }, { username, password }) {
    try {
      const authenticated = await axios.post("/api/authenticate", {
        username, password
      })

      commit("SET_AUTHENTICATED", authenticated)
    } catch (e) {
      throw Error("Произошла ошибка API.")
    }
  }
}
```

Теперь тесты проходят проверку.

## Улучшение

Теперь вы знаете, как тестировать действия в изоляции. Есть, как минимум, одно улучшение, которое можно сделать – это реализовать мок `axios` в виде [пользовательского мока](https://jestjs.io/docs/ru/manual-mocks). Необходимо создать папку `__mocks__` на том же уровне, где находится `node_modules`, и реализовать мок модуль там. Сделав это, вы можете использовать реализацию мока во всех тестах. Jest автоматически использует мок реализации из `__mocks__`. На сайте Jest и в интернете есть множество примеров, как сделать это. Рефакторинг этого теста, используя пользовательский мок, остаётся как упражнение для читателя.


## Заключение

В этом руководстве обсудили:

- как использовать моки Jest для ES6 классов
- как тестировать успешные и неудачные случаи действий

Исходный код для теста на этой странице можно найти [здесь](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app-vue-3/tests/unit/actions.spec.js).
