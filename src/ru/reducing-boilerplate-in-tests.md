## Уменьшаем шаблонный код

> Эта статья доступна в виде скринкаста на [Vue.js Courses](https://vuejs-course.com/screencasts/reducing-duplication-in-tests.html?ref=vth). Посмотреть можно [здесь](https://vuejs-course.com/screencasts/reducing-duplication-in-tests.html?ref=vth).

В идеале каждый модульный тест нужно начинать с новой копии компонента. Также, по мере того, как ваши приложения становятся всё сложнее и больше, есть вероятность, что у вас будет несколько компонентов с различными входными параметрами, и, возможно, сторонними библиотеками по типу Vuetify, VueRouter и Vuex. Это может привести к тому, что в ваших тестах будет много шаблонного кода, т.е. кода, который не имеет прямого отношения к тесту.

В этой статье рассматривается компонент с использованием Vuex и VueRouter, демонстрируются некоторые подходы, которые помогут уменьшить количество шаблонного кода для ваших модульных тестов.

Исходный код для теста на этой странице можно найти [здесь](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/Posts.spec.js).

## Компонент новостей

Это компонент, который мы будем тестировать. Компонент показывает входной параметр `message`, если он был передан. Также показывает кнопку "Добавить новость", если пользователь авторизован, а также выводит список новостей. Оба объекта `authenticated` и `posts` приходят из хранилища Vuex. И, наконец, он отрисовывает компонент`router-link`, который хранит в себе ссылку на новость.

```vue
<template>
  <div>
    <div id="message" v-if="message">{{ message }}</div>

    <div v-if="authenticated">
      <router-link 
        class="new-post" 
        to="/posts/new"
      >
        Добавить новость
      </router-link>
    </div>

    <h1>Новости</h1>
    <div 
      v-for="post in posts" 
      :key="post.id" 
      class="post"
    >
      <router-link :to="postLink(post.id)">
        {{ post.title }}
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Posts',
  props: {
    message: String,
  },

  computed: {
    authenticated() {
      return this.$store.state.authenticated
    },

    posts() {
      return this.$store.state.posts
    }
  },

  methods: {
    postLink(id) {
      return `/posts/${id}`
    }
  }
}
</script>
```

Мы хотим протестировать:

- отрисовывается ли `message`, если входной параметр был передан?
- правильно ли отрисовываются `posts`?
- кнопка "Добавить новость" показывается, когда `authenticated` в значении `true` и скрыта, когда в `false`?

В идеале, тесты должны быть максимально краткими.

## Функции-фабрики Vuex/VueRouter

Серьезным шагом в тестировании приложений является экспорт функций-фабрик для Vuex и VueRouter. Вы часто встречаете что-то похожее: 

```js
// store.js

export default new Vuex.Store({ ... })

// router.js
export default new VueRouter({ ... })
```

Это нормально для обычного приложения, но не идеально для тестирования. Если вы делаете это, то каждый раз, когда вы используете хранилище или роутер в тестах – оно будет доступно среди всех других тестах, которые его импортируют. В идеале, каждый компонент должен получать новую копию хранилища или роутера.

Одним из легких способов решить эту проблему является экспорт функций-фабрик, т.е. функций, который возвращают новый экземпляр объекта. Например:

```js
// store.js
export const store = new Vuex.Store({ ... })
export const createStore = () => {
  return new Vuex.Store({ ... })
}

// router.js
export default new VueRouter({ ... })
export const createRouter = () => {
  return new Vuex.Router({ ... })
}
```
Теперь ваше основное приложение может сделать `import { store } from './store.js`, и ваши тесты смогут получить новую копию хранилища каждый раз, когда будет выполнен `import { createStore } from './store.js`, а затем создан новый экземпляр `const store = createStore()`. То же самое делается и для роутера. Это то, что я сделал в примере `Posts.vue` – исходный код можно найти [здесь](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/src/createStore.js) для хранилища и [здесь](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/src/createRouter.js) для роутера.

## Тесты (перед рефакторингом)

Теперь мы знаем, что представляет из себя `Posts.vue`, как выглядит хранилище и роутер. Теперь мы сможем понять, что делается в тестах: 

```js
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import { mount, createLocalVue } from '@vue/test-utils'

import Posts from '@/components/Posts.vue'
import { createRouter } from '@/createRouter'
import { createStore } from '@/createStore'

describe('Posts.vue', () => {
  it('отрисовывает сообщение, если оно было передано', () => {
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    localVue.use(Vuex)

    const store = createStore()
    const router = createRouter()
    const message = 'Скоро выйдут новые статьи!'
    const wrapper = mount(Posts, {
      propsData: { message },
      store, router,
    })

    expect(wrapper.find("#message").text()).toBe('Скоро выйдут новые статьи!')
  })

  it('отрисовывает новости', async () => {
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    localVue.use(Vuex)

    const store = createStore()
    const router = createRouter()
    const message = 'Скоро выйдут новые статьи!'

    const wrapper = mount(Posts, {
      propsData: { message },
      store, router,
    })

    wrapper.vm.$store.commit('ADD_POSTS', [{ id: 1, title: 'Новость' }])
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.post').length).toBe(1)
  })
})
```
Покрыты не все возможные исходы; Это минимальный набор, которого достаточно для начала. Обратите внимание на дублирование и повторение - давайте избавимся от этого.

## Кастомная функция `createTestVue`

Первые пять строчек каждого теста одинаковые:

```js
const localVue = createLocalVue()
localVue.use(VueRouter)
localVue.use(Vuex)

const store = createStore()
const router = createRouter()
```

Давайте исправим это. Чтобы не путаться с функцией `createLocalVue` из Vue Test Utils, я назову свою функцию `createTestVue`. Она выглядит так:

```js
const createTestVue = () => {
  const localVue = createLocalVue()
  localVue.use(VueRouter)
  localVue.use(Vuex)

  const store = createStore()
  const router = createRouter()
  return { store, router, localVue }
}
```

Теперь мы инкапсулировали всю логику внутри одной функции. Мы возвращаем `store`, `router` и `localVue`, так как нам нужно передавать их в функцию `mount`.

Если мы перепишем первый тест с использованием `createTestVue`, то он будет выглядеть так:

```js
it('отрисовывает сообщение, если оно было передано', () => {
  const { localVue, store, router } = createTestVue()
  const message = 'Скоро выйдут новые статьи!'
  const wrapper = mount(Posts, {
    propsData: { message },
    store,
    router,
    localVue
  })

  expect(wrapper.find("#message").text()).toBe('Скоро выйдут новые статьи!')
})
```

Выглядит лаконичнее. Давайте перепишем второй тест, который использует хранилище Vuex.

```js
it('отрисовывает новости', async () => {
  const { localVue, store, router } = createTestVue()
  const wrapper = mount(Posts, {
    store,
    router,
  })

  wrapper.vm.$store.commit('ADD_POSTS', [{ id: 1, title: 'Новость' }])
  await wrapper.vm.$nextTick()

  expect(wrapper.findAll('.post').length).toBe(1)
})
```

## Определение метода `createWrapper`

Приведенный выше код уже определённо лучше того, что было. Сравнивая эти тесты, можно заметить, что около половины кода всё еще повторяется. Давайте создадим новый метод `createWrapper`, чтобы решить эту проблему.

```js
const createWrapper = (component, options = {}) => {
  const { localVue, store, router } = createTestVue()
  return mount(component, {
    store,
    router,
    localVue,
    ...options
  })
}
```

Теперь мы можем просто вызывать `createWrapper` и получать новую копию компонента готового для тестирования. Теперь наши тесты очень лаконичные.

```js
it('отрисовывает сообщение, если оно было передано', () => {
  const message = 'Скоро выйдут новые статьи!'
  const wrapper = createWrapper(Posts, {
    propsData: { message },
  })

  expect(wrapper.find("#message").text()).toBe('Скоро выйдут новые статьи!')
})

it('отрисовывает новости', async () => {
  const wrapper = createWrapper(Posts)

  wrapper.vm.$store.commit('ADD_POSTS', [{ id: 1, title: 'Новость' }])
  await wrapper.vm.$nextTick()

  expect(wrapper.findAll('.post').length).toBe(1)
})
```

## Установка изначального состояния Vuex

Осталось одно улучшение – как заполнить хранилище. В настоящем приложении, ваше хранилище будет сложным. Вызывать множество мутаций и действий только для того, чтобы получить состояние для тестирования – не самое лучшее решение. Мы можем сделать небольшое изменение в нашей функции `createStore`, которое позволит устанавливать начальное состояние:

```js
const createStore = (initialState = {}) => new Vuex.Store({
  state: {
    authenticated: false,
    posts: [],
    ...initialState
  },
  mutations: {
    // ...
  }
})
```
Теперь мы можем получить желаемое начальное состояние через функцию `createStore`. Мы можем сделать быстрый рефакторинг, объединив `createTestVue` и` createWrapper`:


```js
const createWrapper = (component, options = {}, storeState = {}) => {
  const localVue = createLocalVue()
  localVue.use(VueRouter)
  localVue.use(Vuex)
  const store = createStore(storeState)
  const router = createRouter()

  return mount(component, {
    store,
    router,
    localVue,
    ...options
  })
}
```

Теперь наш тест теперь можно переписать следующим образом:

```js
it('отрисовывает новости', async () => {
  const wrapper = createWrapper(Posts, {}, {
    posts: [{ id: 1, title: 'Новость' }]
  })

  expect(wrapper.findAll('.post').length).toBe(1)
})
```

Это большое улучшение! Мы прошли от теста, где примерно половина кода была шаблонной, и фактически не связана с проверками, до двух строк; один для подготовки компонента к тестированию, а другой для проверки.

Еще один бонус этого рефактора - это гибкая функция `createWrapper`, которую мы можем использовать для всех наших тестов.

## Улучшения

Есть несколько потенциальных улучшений:

- обновить функцию `createStore`, чтобы разрешить установку начального состояния для модулей пространства имен Vuex
- улучшить `createRouter`, чтобы устанавливать конкретный маршрут
- разрешить пользователю передавать аргумент `shallow` или` mount` в `createWrapper`

## Заключение

В этом руководстве обсудили:

- использование функций-фабрик для получения нового экземпляра объекта
- сокращение шаблонного кода и дублирования путём выноса общего кода

Исходный код для теста на этой странице можно найти [здесь](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/Posts.spec.js). Эта статья доступна в виде скринкаста на[Vue.js Courses](https://vuejs-course.com/screencasts/reducing-duplication-in-tests.html?ref=vth).
