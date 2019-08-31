## Заглушки для компонентов

Тест, описанный на этой странице, можно найти найти [здесь](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/ParentWithAPICallChild.spec.js).

## Зачем нужны заглушки?

При написании юнит тестов, мы зачастую хотим использовать _заглушку_ для части кода, которая нам не интересна. Обычно под заглушкой понимают небольшой код, который помещается вместо настоящего. Представим, что вы пишите тест для компонента `<UserContainer>`, который выглядит так:

```vue
<UserContainer>
  <UsersDisplay />
</UserContainer>
```

У `<UsersDisplay>` есть хук жизненного цикла `created`:

```js
created() {
  axios.get("/users")
}
```

Мы хотим написать тест, который проверяет, что `<UsersDisplay>` отрисовался.

В хуке `created` `axios` делает ajax-запрос к внешнему сервису . Это значит, что когда вы делаете `mount(UserContainer)`, `<UsersDisplay>` также монтируется и в хуке `created`  выполняется ajax-запрос. Так как это юнит тест, мы должны тестировать только то, что `<UserContainer>` правильно отрисовывает `<UsersDisplay>`. Проверка, что ajax-запрос выполняется с правильным endpoint и т.д. – это задача `<UsersDisplay>`, которая должна быть протестирована в файле для `<UsersDisplay>`.

Одним из способов предотвратить вызов ajax-запроса в `<UsersDisplay>` – использовать _заглушку_ для компонента. Давайте напишем наш собственный компонент и тест к нему, чтобы лучше понять способы использования заглушек и пользу от них.

## Создание компонента

В этом примере будем использовать два компонента. Первый это `ParentWithAPICallChild`, который просто отрисовывает другой компонент.

```vue
<template>
  <ComponentWithAsyncCall />
</template>

<script>
import ComponentWithAsyncCall from "./ComponentWithAsyncCall.vue"

export default {
  name: "ParentWithAPICallChild",

  components: {
    ComponentWithAsyncCall
  }
}
</script>
```

`<ParentWithAPICallChild>` – простой компонент, который отвечает только за отрисовку `<ComponentWithAsyncCall>`. `<ComponentWithAsyncCall>`, как следует из названия, делает ajax-запрос, используя http-клиент `axios`.

```vue
<template>
  <div></div>
</template>

<script>
import axios from "axios"

export default {
  name: "ComponentWithAsyncCall",
  
  created() {
    this.makeApiCall()
  },
  
  methods: {
    async makeApiCall() {
      console.log("Делаю запрос к API")
      await axios.get("https://jsonplaceholder.typicode.com/posts/1")
    }
  }
}
</script>
```

`<ComponentWithAsyncCall>` вызывает `makeApiCall` в своём хуке жизненного цикла `created`.

## Написание теста, используя `mount`

Давайте начнем с написания теста, в котором проверим, что `<ComponentWithAsyncCall>` отрисовался:

```js
import { shallowMount, mount } from '@vue/test-utils'
import ParentWithAPICallChild from '@/components/ParentWithAPICallChild.vue'
import ComponentWithAsyncCall from '@/components/ComponentWithAsyncCall.vue'

describe('ParentWithAPICallChild.vue', () => {
  it('отрисовывается с помощью mount и делает вызов API', () => {
    const wrapper = mount(ParentWithAPICallChild)

    expect(wrapper.find(ComponentWithAsyncCall).exists()).toBe(true)
  })
})
```

Запуск `yarn test:unit` выведет:

```bash
PASS  tests/unit/ParentWithAPICallChild.spec.js

console.log src/components/ComponentWithAsyncCall.vue:17
  Делаю запрос к API
```

Тест прошел проверку – отлично! Тем не менее, мы можем сделать лучше. Как вы заметили, в тесте `console.log` вызывается из метода `makeApiCall`. В идеале, мы не хотим делать вызовы к стронним сервисам в наших юнит тестах, особенно когда они происходят в компоненте, который мы не тестируем. Мы можем использовать `stubs` в опции монтирования, как описано в [документации](https://vue-test-utils.vuejs.org/ru/api/options.html#stubs) `vue-test-utils`.

## Использования `stubs` для заглушки `<ComponentWithAsyncCall>`

Давайте обновим тест, используя в этот раз заглушку для `<ComponentWithAsyncCall>`:

```js
it('отрисовывается с помощью mount и делает вызов API', () => {
  const wrapper = mount(ParentWithAPICallChild, {
    stubs: {
      ComponentWithAsyncCall: true
    }
  })

  expect(wrapper.find(ComponentWithAsyncCall).exists()).toBe(true)
})
```

Тест все еще проходит проверку, если напишем `yarn test:unit`. Однако `console.log` больше не выводится. Это потому что передавая `[component]: true` в `stubs`, мы заменяем настоящий компонент _заглушкой_. Внешний интерфейс остался прежним (мы все также можем выбирать что-либо через `find`, так как свойство `name`, которое используется внутри `find`, осталось таким же). Внутренние методы, такие как `makeApiCall`, заменились на подставные, которые ничего не делают – они заглушились.

Вы также можете указать разметку, которая используется для заглушки, например:

```js
const wrapper = mount(ParentWithAPICallChild, {
  stubs: {
    ComponentWithAsyncCall: "<div class='stub'></div>"
  }
})
```

## Автоматические заглушки с помощью `shallowMount`

Вместо того, чтобы использовать `mount` и вручную делать заглушку для `<ComponentWithAsyncCall>`, мы можем просто использовать `shallowMount`, который по умолчанию автоматически подставляет заглушки для других компонентов. Тест с `shallowMount` выглядит так:

```js
it('отрисовывается с помощью mount и делает вызов API', () => {
  const wrapper = shallowMount(ParentWithAPICallChild)

  expect(wrapper.find(ComponentWithAsyncCall).exists()).toBe(true)
})
```

Запуск `yarn test:unit` не выводит никаких `console.log`, а тесты проходят проверку. `shallowMount` автоматически подставил заглушку для `<ComponentWithAsyncCall>`. `shallowMount` полезен при тестировании компонентов, у которых много дочерних компонентов с различной логикой внутри хуков жизненного цикла `created`, `mounted` и т.д. Я, как правило, по умолчанию использую `shallowMount`, если у меня нет весомых причин использовать `mount`. Всё зависит от случая и того, что вы тестируете.

## Заключение

- `stubs` полезен, когда нужно использовать заглушки для логики дочерних компонентов, который не принадлежат текущему юнит тесту.
- `shallowMount` по умолчанию подставляет заглушки для дочерних компонентов
- вы можете передать `true`, чтобы создать стандартную заглушку или передать собственную реализацию


Тест, описанный на этой странице, можно найти найти [здесь](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/ParentWithAPICallChild.spec.js).
