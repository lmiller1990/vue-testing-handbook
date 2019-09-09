## Мутации и действия

В предыдущем руководстве обсуждалось как тестировать компоненты, которые используют `$store.state` и `$store.getters`. Оба метода дают представление о состоянии приложения. Когда проверяется, что компонент правильно вызывает мутацию или действие, мы хотим убедиться, что `$store.commit` и `$store.dispatch` вызываются с правильной функцией-обработчиком и нагрузкой.


Есть два способа сделать это. Первый – это использовать настоящее Vuex хранилище с использованием `createLocalVue`. Второй – использовать мок для хранилища. Обе техники продемонстрированы [здесь](https://lmiller1990.github.io/vue-testing-handbook/ru/vuex-in-components.html). Давайте посмотрим на них снова, но уже в контексте мутаций и действий.

Исходный код для теста на этой странице можно найти [здесь](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/ComponentWithButtons.spec.js).

## Создание компонента

Для примеров мы будем тестировать компонент `<ComponentWithButtons>`:

```vue
<template>
  <div>
    <button 
      class="commit" 
      @click="handleCommit">
      Commit
    </button>

    <button 
      class="dispatch" 
      @click="handleDispatch">
      Dispatch
    </button>

    <button 
      class="namespaced-dispatch" 
      @click="handleNamespacedDispatch">
          Именованный Dispatch
    </button>
  </div>
</template>

<script>
export default {
  name: "ComponentWithButtons",

  methods: {
    handleCommit() {
      this.$store.commit("testMutation", { msg: "Тестовый Commit" })
    },

    handleDispatch() {
      this.$store.dispatch("testAction", { msg: "Тестовый Dispatch" })
    },

    handleNamespacedDispatch() {
      this.$store.dispatch("namespaced/very/deeply/testAction", { msg: "Тестовый именованный Dispatch" })
    }
  }
}
</script>
```

## Тестирование с настоящим Vuex хранилищем

Давайте создадим `ComponentWithButtons.spec.js` для теста мутации. Помните: мы хотим убедиться в двух вещах: 

1. Правильная ли мутация вызывается?
2. Правильная ли была нагрузка?

Мы будем использовать `createLocalVue`, чтобы избежать засорения глобального Vue экземпляра.

```js
import Vuex from "vuex"
import { createLocalVue, shallowMount } from "@vue/test-utils"
import ComponentWithButtons from "@/components/ComponentWithButtons.vue"

const localVue = createLocalVue()
localVue.use(Vuex)

const mutations = {
  testMutation: jest.fn()
}

const store = new Vuex.Store({ mutations })

describe("ComponentWithButtons", () => {

  it("вызывает мутацию после клика по кнопке", () => {
    const wrapper = shallowMount(ComponentWithButtons, {
      store, localVue
    })

    wrapper.find(".commit").trigger("click")

    expect(mutations.testMutation).toHaveBeenCalledWith(
      {},
      { msg: "Тестовый Commit" }
    )
  })
})
```

Здесь очень много кода, но ничего особенного не происходит. Мы создаём `localVue` и используем Vuex, затем, создаём хранилище, передаём мок функцию (`jest.fn()`) вместо `testMutation`. Vuex мутации всегда вызываются с двумя аргументами: первым идёт текущее состояние, вторым - нагрузка. Так как мы не объявляли никакого состояния для хранилища, ожидаем, что вызов был с пустым объектом. Вторым аргументом ожидаем `{ msg: "Test Commit" }`, который захардкожен в компоненте.

Получилось очень много шаблонного кода, но это правильный и работающий способ проверить работу компонента. В качестве альтернативы можно использовать мок для хранилища. Поймём как это делать в процессе тестирования вызова `testAction`.

## Тестирование, используя мок для хранилища

Посмотрите на код и сравните его с предыдущим тестом. Помните, мы хотим убедиться, что:

1. было вызвано правильное действие
2. нагрузка была правильной

```js
it("вызывает действие после клика по кнопке", () => {
  const mockStore = { dispatch: jest.fn() }
  const wrapper = shallowMount(ComponentWithButtons, {
    mocks: {
      $store: mockStore 
    }
  })

  wrapper.find(".dispatch").trigger("click")
  
  expect(mockStore.dispatch).toHaveBeenCalledWith(
    "testAction" , { msg: "Тестовый Dispatch" })
})
```

Получилось намного компактнее, чем в предыдущем примере. Нет `localVue` и `Vuex`, вместо мока функции `testMutation = jest.fn()`, мы используем мок для самой функции `dispatch`. Так как `$store.dispatch` – это обычная JavaScript функции, мы можем себе это позволить. Затем, мы проверяем, что вызов был с правильной функцией-обработчиком `testAction` и нагрузкой, которые выступают в качестве первого и второго аргументов. Нам не важно, что на самом деле выполняет действие – его можно протестировать в изоляции. Цель этого теста - просто убедиться, что при клике на кнопку вызывается действие с правильной функцией-обработчиком и нагрузкой.

Использовать ли настоящее хранилище или мок в ваших тестах, зависит от личных предпочтений. Оба способа правильные. Важно то, что вы тестируете компоненты.

## Тестирование именованных действий (или мутаций)

В третьем и последнем примере посмотрим на еще один способ тестирования того, что действие (или мутация) было вызвано с правильными аргументами. Этот способ объединяет обе техники из примеров выше: настоящее `Vuex` хранилище и использование мока для метода `dispatch`.

```js
it("вызывает именованное действие после клика по кнопке", () => {
  const store = new Vuex.Store()
  store.dispatch = jest.fn()

  const wrapper = shallowMount(ComponentWithButtons, {
    store, localVue
  })

  wrapper.find(".namespaced-dispatch").trigger("click")

  expect(store.dispatch).toHaveBeenCalledWith(
    'namespaced/very/deeply/testAction',
    { msg: "Тестовый именованный Dispatch" }
  )
})
```

Мы начинаем с создания Vuex хранилища с модулями, которые нам интересны. Я объявляю модуль `namespacedModule` внутри теста, но в настоящем приложении вы можете просто импортировать модули, от которых зависит ваш компонент. Затем, мы заменяем метод `dispatch` на мок` jest.fn` и делаем проверку.
 

## Заключение


В этой секции мы рассмотрели:

1. как использовать Vuex с `localVue` для мока мутаций
2. как мокать Vuex API (`dispatch` и `commit`)
3. как использовать настоящее Vuex хранилище и мок для функции `dispatch`

Исходный код для теста на этой странице можно найти [здесь](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/ComponentWithButtons.spec.js).
