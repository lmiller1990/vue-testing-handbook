## Тестирование Vuex в компонентах

Исходный код для теста на этой странице можно найти [здесь](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/ComponentWithVuex.spec.js).


## Использование `createLocalVue` для тестирования `$store.state`

В обычном Vue приложении мы устанавливаем Vuex, используя `Vue.use(Vuex)`, а затем, передаем новое хранилище Vuex в приложение. Если мы сделаем тоже самое в юнит тесте, то все тесты получат Vuex хранилище, даже если оно не используется. `vue-test-utils` предоставляет метод `createLocalVue`, создающий временный экземпляр `Vue`, который можно использовать в тестах. Давайте рассмотрим, как это использовать. Сначала сделаем простой компонент `<ComponentWithGetters>`, который отрисовывает имя пользователя, основываясь на состоянии хранилища.

```html
<template>
  <div>
    <div class="username">
      {{ username }}
    </div>
  </div>
</template>

<script>
export default {
  name: "ComponentWithVuex",

  data() {
    return {
      username: this.$store.state.username
    }
  }
}
</script>
```

Мы можем использовать `createLocalVue` для создания временного экземпляра Vue, в который установим Vuex. Затем, просто передадим новый `store` в опции монтирования компонента. Полный тест выглядит так:

```js
import Vuex from "vuex"
import { shallowMount, createLocalVue } from "@vue/test-utils"
import ComponentWithVuex from "@/components/ComponentWithVuex.vue"

const localVue = createLocalVue()
localVue.use(Vuex)

const store = new Vuex.Store({
  state: {
    username: "Алиса"
  }
})

describe("ComponentWithVuex", () => {
  it("отрисовывает имя пользователя из настоящего Vuex хранилища", () => {
    const wrapper = shallowMount(ComponentWithVuex, { 
      store, 
      localVue 
    })

    expect(wrapper.find(".username").text()).toBe("Алиса")
  })
})
```

Тест проходит проверку. Создание нового `localVue` вводит некоторый шаблон, из-за чего тест длится дольше.

Если у вас много компонентов, использующих Vuex хранилище, то будет лучше использовать `mocks` опцию монтирования и просто замокать хранилище.

## Использование замоканного хранилища

Используя опцию монтирования `mocks`, вы можете замокать глобальный объект `$store`. Это значит, что вам не нужно применять `createLocalVue` или создавать новое Vuex хранилище. Используя эту технику, тест выше можно переписать так:

```js
it("отрисовывает имя пользователя, используя замоканное хранилище", () => {
  const wrapper = shallowMount(ComponentWithVuex, {
    mocks: {
      $store: {
        state: { username: "Алиса" }
      }
    }
  })

  expect(wrapper.find(".username").text()).toBe("Алиса")
})
```

Лично я предпочитаю такой подход. Все необходимые данные объявляются внутри теста и он становится более компактным. Обе техники полезны, и ни одна не лучше и не хуже, чем другая.

## Тестирование `getters`

Используя вышеупомянутые техники, `getters` достаточно просто тестировать. Сначала сделаем компонент для теста:

```html
<template>
  <div class="fullname">
    {{ fullname }}
  </div>
</template>

<script>
export default {
  name: "ComponentWithGetters",

  computed: {
    fullname() {
      return this.$store.getters.fullname
    }
  }
}
</script>
```

Мы хотим проверить, что компонент правильно отрисовывает `fullname` пользователя. Для этого теста, нам не важно откуда приходит `fullname`, важно только, правильно ли оно отрисуется.

Сначала, используя настоящее Vuex хранилище и `createLocalVue`, тест будет выглядеть так:

```js
const localVue = createLocalVue()
localVue.use(Vuex)

const store = new Vuex.Store({
  state: {
    firstName: "Алиса",
    lastName: "Доу"
  },

  getters: {
    fullname: (state) => state.firstName + " " + state.lastName
  }
})

it("отрисовывает имя пользователя используя настощий геттер Vuex", () => {
  const wrapper = shallowMount(ComponentWithGetters, { store, localVue })

  expect(wrapper.find(".fullname").text()).toBe("Алиса Доу")
})
```

Тест очень компактный – всего две строчки кода. Тем не менее, здесь много настроек – мы перестраиваем хранилище Vuex. Как альтернатива можно импортировать настоящее хранилище Vuex с реальным геттером. Это вводит в тест еще одну зависимость, и при разработке большой системы возможно, что хранилище Vuex может быть разработано другим программистом и еще не реализовано.

Давайте посмотрим как мы можем написать тест, используя опцию монтирования `mocks`.


```js
it("отрисовываем имя пользователя, используя вычисленные опции монтирования", () => {
  const wrapper = shallowMount(ComponentWithGetters, {
    mocks: {
      $store: {
        getters: {
          fullname: "Алиса Доу"
        }
      }
    }
  })

  expect(wrapper.find(".fullname").text()).toBe("Алиса Доу")
})
```

Теперь вся необходимая информация содержиться в тесте. Отлично! Я всегда предпочитаю этот подход, так как тест полностью самостоятельный, в нём есть всё для понимания работы тестируемого компонента.

Мы можем сделать тест еще короче, используя `computed` в опции монтирования.

## Мокаем геттеры используя `computed`

Геттеры обычно оборачиваются в `computed` свойство.
Помните, этот тест о том, как компонент поведёт себя в зависимости от текущего состояния хранилища. Мы не тестируем реализацию `fullname` или работу геттера. Это значит, что мы должны просто заменить настощее хранилище или замокать его, используя `computed` в опции монтирования. Тест можно переписать так:

```js
it("отрисовываем имя пользователя, используя вычисляемое свойство в  опции монтирования", () => {
  const wrapper = shallowMount(ComponentWithGetters, {
    computed: {
      fullname: () => "Алиса Доу"
    }
  })

  expect(wrapper.find(".fullname").text()).toBe("Алиса Доу")
})
```

Тест более короткий, чем два предыдущих, но все также выражает намерение компонента.

## Помошники `mapState` и `mapGetters` 

Техники, описанные выше, также работают вместе с помощниками `mapState` и `mapGetters`. Мы можем обновить  `ComponentWithGetters` вот так:

```js
import { mapGetters } from "vuex"

export default {
  name: "ComponentWithGetters",

  computed: {
    ...mapGetters([
      'fullname'
    ])
  }
}
```

Тест все еще проходит проверку.

## Заключение

В этом руководстве обсудили.

- как использовать `createLocalVue` и настощее хранилище Vuex для тестирования `$store.state` и `getters`
- как использовать `mocks` в опцииях монтирования, для того, чтобы замокать `$store.state` и `getters`
- как использовать `computed` в опциях монтирования, чтобы устаналивать желаемое значение для Vuex геттера

Техники, для тестирования реализации Vuex геттеров в изоляции можно найти в [этом руководстве](https://lmiller1990.github.io/vue-testing-handbook/ru/vuex-getters.html).

Исходный код для теста на этой странице можно найти [здесь](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/ComponentWithVuex.spec.js).
