## Vue Router

Так как роутер обычно включает в себя несколько компонентов, работающих вместе, тесты для роутера занимают место в [пирамиде тестирования](https://medium.freecodecamp.org/the-front-end-test-pyramid-rethink-your-testing-3b343c2bca51) на уровне e2e/интеграционных тестов. Тем не менее, иметь несколько юнит тестов вокруг роутинга не помешает.

Как обсуждалось в предыдущих секциях, есть два способа тестирования компонентов, которые работают с роутером:

1. использовать настоящий экземпляр роутера
2. замокать глобальные объекты `$route` и `$router`

Так как большинство Vue приложений использует официальную библиотеку Vue Router, в этом руководстве сфокусируемся на ней.

Исходный код для тестов на этой странице можно найти [здесь](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/App.spec.js) и [здесь](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/NestedRoute.spec.js).

## Создание компонентов

Создадим простой `<App>`, у которого есть путь `/nested-child`. Перейдя на `/nested-child`, будет отрисован компонент `<NestedRoute>`. Сделаем файл `App.vue` и вставим следующий минимальный компонент:

```vue
<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>

export default {
  name: 'app'
}
</script>
```

`<NestedRoute>` также минимален:

```vue
<template>
  <div>Внутренний маршрут</div>
</template>

<script>
export default {
  name: "NestedRoute"
}
</script>
```

## Создание роутера и маршрутов

Теперь нам нужно несколько маршрутов для тестирования. Давайте начнём с такого маршрута:

```js
import NestedRoute from "@/components/NestedRoute.vue"

export default [
  { path: "/nested-route", component: NestedRoute }
]
```

В настоящем приложении, вы обычно создаёте файл `router.js` и импортируете все созданные маршруты, а мы напишем так:

```js
import Vue from "vue"
import VueRouter from "vue-router"
import routes from "./routes.js"

Vue.use(VueRouter)

export default new VueRouter({ routes })
```

Так как мы не хотим засорять глобальное пространство имён, вызывая `Vue.use(...)` в наших тестах, создадим роутер внутри теста. Это даст нам больше контроля над состоянием приложения в течение юнит тестирования.

## Написание теста

Давайте посмотрим на код, а затем обсудим, что он делает. Мы тестируем `App.vue`, поэтому в `App.spec.js` напишем следующее:

```js
import { shallowMount, mount, createLocalVue } from "@vue/test-utils"
import App from "@/App.vue"
import VueRouter from "vue-router"
import NestedRoute from "@/components/NestedRoute.vue"
import routes from "@/routes.js"

const localVue = createLocalVue()
localVue.use(VueRouter)

describe("App", () => {
  it("отрисовывает дочерний компонент с помощью роутинга", () => {
    const router = new VueRouter({ routes })
    const wrapper = mount(App, { localVue, router })

    router.push("/nested-route")

    expect(wrapper.find(NestedRoute).exists()).toBe(true)
  })
})
```

Как обычно, мы начинаем с импорта различных модулей для теста. В частности, мы импортируем настоящие маршруты, которые будем использовать для приложения. В некоторых случаях - это идеально: если настоящий роутер сломается, юнит тесты также не пройдут проверку, что даст нам возможность поправить приложение перед 
развёртыванием.
 
Мы можем использовать один и тот же `localVue` для всех тестов `<App>`, поэтому он был объявлен вне первого блока `describe`. Тем не менее, мы хотим делать различные тесты для различных маршрутов, поэтому роутер объявлен внутри блока `it`.

Еще одна важная часть: мы используем `mount` вместо `shallowMount`, как было в других тестах. Если мы применим `shallowMount`, тогда `<router-link>` заменится на заглушку и вне зависимости от текущего маршрута будет отображена эта бесполезная заглушка. 

## Обход отрисовки большого дерева при использовании `mount`

Использовать `mount` хорошо в некоторых случаях, но иногда - это не идеально. Например, когда вы отрисовываете весь компонент `<App>`, содержащий большое дерево с множеством компонентов, у которых есть дочерние компоненты и т.д. У всех компонентов сработают хуки жизненного цикла, где могут быть обращения к API и т.д.

Если вы используете Jest, его мощная система для моков позволяет элегантно решить эту проблему. Вы можете просто использовать мок для дочерних компонентов, в нашем случае для `<NestedRoute>`. Используем следующий мок и тесты всё еще пройдут проверку:


```js
jest.mock("@/components/NestedRoute.vue", () => ({
  name: "NestedRoute",
  render: h => h("div")
}))
```

## Используем мок для роутера

Иногда настоящий роутер не нужен. Давайте обновим `<NestedRoute>`, чтобы он показывал имя пользователя в зависимости от текущего маршрута. В этот раз мы применим подход TDD для реализации теста. Вот базовый тест, который отрисовывает компонент и делает проверку:

```js
import { shallowMount } from "@vue/test-utils"
import NestedRoute from "@/components/NestedRoute.vue"
import routes from "@/routes.js"

describe("NestedRoute", () => {
  it("отрисовывает имя пользователя из строки запроса", () => {
    const username = "alice"
    const wrapper = shallowMount(NestedRoute)

    expect(wrapper.find(".username").text()).toBe(username)
  })
})
```

У нас ещё нет `<div class="username">`, поэтому запуск теста выдаст ошибку:

```bash
FAIL  tests/unit/NestedRoute.spec.js
  NestedRoute
    ✕ отрисовывает имя пользователя из строки запроса (25ms)

  ● NestedRoute › отрисовывает имя пользователя из строки запроса

    [vue-test-utils]: find did not return .username, cannot call text() on empty Wrapper
``` 

Обновим `<NestedRoute>`:

```vue
<template>
  <div>
    Nested Route
    <div class="username">
      {{ $route.params.username }}
    </div>
  </div>
</template>
```

Теперь тест упадёт со следующей ошибкой:

```bash
FAIL  tests/unit/NestedRoute.spec.js
  NestedRoute
    ✕ отрисовывает имя пользователя из строки запроса (17ms)

  ● NestedRoute › отрисовывает имя пользователя из строки запроса

    TypeError: Cannot read property 'params' of undefined
```

Это потому что `$route` не существует. Мы может использовать настоящий роутер, но в этом случае легке использовать `mocks` в опции монтирования:

```js
it("отрисовывает имя пользователя из строки запроса", () => {
  const username = "alice"
  const wrapper = shallowMount(NestedRoute, {
    mocks: {
      $route: {
        params: { username }
      }
    }
  })

  expect(wrapper.find(".username").text()).toBe(username)
})
```

Теперь тест проходит проверку. В этом случае нам не нужно переходить куда-то или делать что-либо связанное с реализацией роутера, поэтому использование `mocks` оправдано. Нам не важно откуда берется `username` в строке поиска, только то что он там есть.

Часто сервер обеспечивает маршрутизацию, в отличие от клиентской маршрутизации с помощью Vue Router. В таких случаях, использовать `mocks` для установки строки поиска в тестах является хорошей альтернативой использования реального экземпляра Vue Router.


## Стратегия для тестирования роутер хуков

Vue Router предоставляет несколько типов хуков, называемыми [навигационными хуками
](https://router.vuejs.org/ru/guide/advanced/navigation-guards.html). Два таких примера:

1. Глобальные хуки завершения перехода (`router.beforeEach`). Объявляются в экземпляре роутера.
2. Хуки для конкретных компонентов, такие как `beforeRouteEnter`. Объявляются в компонентах.

Проверка правильности их работы обычно является задачей интеграционного теста, поскольку пользователь должен перемещаться от одного маршрута к другому. Тем не менее вы также можете использовать юнит тесты, чтобы проверить правильно ли работают функции, вызываемые в навигационных хуках, и получить более быстрые отзывы о потенциальных ошибках. Вот некоторые стратегии по отделению логики от хуков навигации и написанию модульных тестов вокруг них.


## Глобальные хуки завершения перехода

Представим: у вас есть функция `bustCache`, которая должна вызываться на каждом маршруте, который содержит мета поле `shouldBustCache`. Ваши пути выглядели бы примерно так:

```js
import NestedRoute from "@/components/NestedRoute.vue"

export default [
  {
    path: "/nested-route",
    component: NestedRoute,
    meta: {
      shouldBustCache: true
    }
  }
]
```

Используя мета поля `shouldBustCache`, вы хотите очистить текущий кэш, чтобы гарантировать, что пользователь не получит устаревшие данные. Реализация может выглядеть так:

```js
import Vue from "vue"
import VueRouter from "vue-router"
import routes from "./routes.js"
import { bustCache } from "./bust-cache.js"

Vue.use(VueRouter)

const router = new VueRouter({ routes })

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.shouldBustCache)) {
    bustCache()
  }
  next()
})

export default router
```

В нашем юнит тесте, вы __можете__ импортировать экземпляр роутера и попытаться вызвать `beforeEach`, написав `router.beforeHooks[0]()`. Это приведёт к ошибке в строке с `next`, так как вы не передали правильные аргументы. Вместо этого применяется стратегия, при которой нужно отделить и независимо экспортировать хук навигации `beforeEach`, перед его подключением к роутеру. Как насчёт такого:

```js
export function beforeEach(to, from, next) {
  if (to.matched.some(record => record.meta.shouldBustCache)) {
    bustCache()
  }
  next()
}

router.beforeEach((to, from, next) => beforeEach(to, from, next))

export default router
```

Теперь писать тесты легко, хоть и немного долго:

```js
import { beforeEach } from "@/router.js"
import mockModule from "@/bust-cache.js"

jest.mock("@/bust-cache.js", () => ({ bustCache: jest.fn() }))

describe("beforeEach", () => {
  afterEach(() => {
    mockModule.bustCache.mockClear()
  })

  it("обнуляет кэш при переходе на /user", () => {
    const to = {
      matched: [{ meta: { shouldBustCache: true } }]
    }
    const next = jest.fn()

    beforeEach(to, undefined, next)

    expect(mockModule.bustCache).toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  it("обнуляет кэш при переходе на /user", () => {
    const to = {
      matched: [{ meta: { shouldBustCache: false } }]
    }
    const next = jest.fn()

    beforeEach(to, undefined, next)

    expect(mockModule.bustCache).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })
})
```

Главное что нас интересует - это то, что мы применяем мок для всего модуля с помощью `jest.mock`, и сбрасываем мок с помощью хука `afterEach`. Экспортируя `beforeEach`, как обычную, разделённую функцию JavaScript, это становится банально тестировать.

Чтобы убедиться, что хук на самом деле вызывает `bustCache` и отображает самые последние данные, можно использовать инструмент тестирования e2e, такой как [Cypress.io](https://www.cypress.io/), который поставляется с приложениями, созданными с использованием vue-cli.


## Хуки для конкретных компонентов

Хуки для конкретных компонентов также легко тестировать, если рассматривать их, как обычные функции JavaScript. Допустим, мы добавили хук `beforeRouteLeave` к `<NestedRoute>`:

```vue
<script>
import { bustCache } from "@/bust-cache.js"
export default {
  name: "NestedRoute",

  beforeRouteLeave(to, from, next) {
    bustCache()
    next()
  }
}
</script>
```

Мы можем тестировать это также, как и глобальные хуки:

```js
// ...
import NestedRoute from "@/components/NestedRoute.vue"
import mockModule from "@/bust-cache.js"

jest.mock("@/bust-cache.js", () => ({ bustCache: jest.fn() }))

it("вызывает bustCache и next при переходе из маршрута", () => {
  const next = jest.fn()
  NestedRoute.beforeRouteLeave(undefined, undefined, next)

  expect(mockModule.bustCache).toHaveBeenCalled()
  expect(next).toHaveBeenCalled()
})
```

Хотя этот стиль юнит тестирования может быть полезен для немедленной обратной связи во время разработки, так как маршрутизаторы и навигационные хуки часто взаимодействуют с несколькими компонентами для достижения некоторого эффекта, вам также необходимо провести интеграционные тесты, чтобы убедиться, что все работает должным образом.


## Заключение

В этом руководстве рассмотрели:

- тестирование компонентов, которые отрисовываются по условию с помощью Vue Router
- использование моков для Vue компонентов, с помощью `jest.mock` и `localVue`
- отсоединение глобальных навигационных хуков от маршрутизатора и их независимое тестирование
- использование `jest.mock` для моков модулей

Исходный код для тестов на этой странице можно найти [здесь](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/App.spec.js) и [здесь](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/NestedRoute.spec.js).
