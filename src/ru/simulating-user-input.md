## Инициирование событий

Обработка пользовательского ввода – одна из самых распространённых задач во Vue-компонентах. `vue-test-utils` и Jest позволяют с лёгкостью тестировать ввод данных. Давайте посмотрим, как можно использовать `trigger` и моки Jest, чтобы убедиться в правильности работы компонента.

Исходный код для теста можно найти [здесь](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/FormSubmitter.spec.js).

## Создание компонента

Мы создадим простой компонент с формой `<FormSubmitter>`, содержащий `<input>` и `<button>`. Когда происходит клик по кнопке, что-то должно произойти. Сначала будем выводить сообщение об успешной отправке формы, затем разберём более интересные примеры, в которых отправка будет происходить к некоторому endpoint.


Создадим `<FormSubmitter>` и добавим следующий шаблон:

```vue
<template>
  <div>
    <form @submit.prevent="handleSubmit">
      <input v-model="username" data-username>
      <input type="submit">
    </form>

    <div 
      class="message" 
      v-if="submitted"
    >
      Спасибо за ваше сообщение, {{ username }}.
    </div>
  </div>
</template>
```
Когда пользователь отправляет форму, мы показываем сообщение, в котором благодарим его. Мы хотим отправлять форму асинхронно: для этого используется `@submit.prevent`, который предотвращает обычное поведение формы, а именно – обновление страницы после отправления.

Теперь добавим логику для отправки формы:

```vue
<script>
  export default {
    name: "FormSubmitter",

    data() {
      return {
        username: '',
        submitted: false
      }
    },

    methods: {
      handleSubmit() {
        this.submitted = true
      }
    }
  }
</script>
```

Всё достаточно просто: мы устанавливаем `submitted` в значение `true`, когда форма отправлена. После чего появляется `<div>` c благодарственным сообщением. 

## Написание теста

Давайте посмотрим на тест:

```js
import { shallowMount } from "@vue/test-utils"
import FormSubmitter from "@/components/FormSubmitter.vue"

describe("FormSubmitter", () => {
  it("Показывает сообщение после отправки", () => {
    const wrapper = shallowMount(FormSubmitter)

    wrapper.find("[data-username]").setValue("Алиса")
    wrapper.find("form").trigger("submit.prevent")

    expect(wrapper.find(".message").text())
      .toBe("Спасибо за ваше сообщение, Алиса.")
  })
})
```

Этот тест достаточно понятен. Мы используем `shallowMount` для компонента, устанавливаем значение и применяем `trigger` метод из `vue-test-utils`, который симулирует пользовательский ввод. `trigger` также работает с пользовательскими событиями и с их модификаторами, например, `submit.prevent`, `keydown.enter` и так далее.

Этот тест также следует трём этапам юнит-тестирования:

1. Предусловие(arrange) – подготовка к тестированию. В нашем случае - это отрисовка компонента.
2. Действие(act) – выполнение действий системы.
3. Утверждение(assert) – убеждение в соответствии ожидаемого и полученного результата.

Мы разделили каждый этап пустой строкой, что делает наши тесты более понятными.

Запустим тест через `yarn test:unit`. Он должен пройти.

Триггер достаточно простой: используем `find`, чтобы получить элемент, в котором будем симулировать ввод, затем вызываем `trigger` c названием события и модификатором.

## Реальный пример

Формы обычно отправляют к некоему endpoint. Давайте разберёмся, как тестировать компонент с разными реализациями `handleSubmit`. Обычной практикой является добавления алиаса `Vue.prototype.$http` для вашей HTTP-библиотеки. Это позволяет нам делать ajax-запросы просто вызывая `this.$http.get(...)`. Подробнее об этом можно почитать [тут](https://ru.vuejs.org/v2/cookbook/adding-instance-properties.html)

Чаще всего http-библиотекой является `axios`, популярный HTTP клиент. В этом случае `handleSubmit` выглядел бы примерно так:


```js
handleSubmitAsync() {
  return this.$http.get("/api/v1/register", { username: this.username })
    .then(() => {
      // показываем собщение об успешной отправке
    })
    .catch(() => {
      // обрабатываем ошибки
    })
}
```

В этом случае, одним из способов тестирования является _мок_ для `this.$http`, чтобы создать желанную среду для тестирования. Подробнее об опциях `mocks` можно почитать [здесь](https://vue-test-utils.vuejs.org/ru/api/options.html#mocks). Давайте посмотрим на мок реализацию `http.get` метода:


```js
let url = ''
let data = ''

const mockHttp = {
  get: (_url, _data) => {
    return new Promise((resolve, reject) => {
      url = _url
      data = _data
      resolve()
    })
  }
}
```

Здесь есть несколько интересных вещей:

- мы создаём переменные `url` и `data`, чтобы сохранить `url` и `data`, переданные в `$http.get`. Это позволяет убедиться в том, что запрос достигает своего endpoint c правильными данными.
- после присваивания `url` и `data` мы немедленно резолвим промис, тем самым, симулируя успешный ответ от API.

Перед тем, как посмотрим на тест, добавим новую функцию `handleSubmitAsync`:

```js
methods: {
  handleSubmitAsync() {
    return this.$http.get("/api/v1/register", { username: this.username })
      .then(() => {
        this.submitted = true
      })
      .catch((e) => {
        throw Error("Что-то пошло не так", e)
      })
  }
}
```

Также обновим `<template>`, используя новый метод `handleSubmitAsync` 

```vue
<template>
  <div>
    <form @submit.prevent="handleSubmitAsync">
      <input v-model="username" data-username>
      <input type="submit">
    </form>

  <!-- ... -->
  </div>
</template>
```

Теперь тестируем.

## Мокаем ajax вызов

Сперва, добавим наверху мок реализацию `this.$http`, прямо перед блоком `describe`:

```js
let url = ''
let data = ''

const mockHttp = {
  get: (_url, _data) => {
    return new Promise((resolve, reject) => {
      url = _url
      data = _data
      resolve()
    })
  }
}
```

Теперь добавим тест, передавая мок `$http` в `mocks` при монтировании:

```js
it("Показывает сообщение после отправки", () => {
  const wrapper = shallowMount(FormSubmitter, {
    mocks: {
      $http: mockHttp
    }
  })

  wrapper.find("[data-username]").setValue("Алиса")
  wrapper.find("form").trigger("submit.prevent")

  expect(wrapper.find(".message").text())
    .toBe("Спасибо за ваше сообщение, Алиса.")
})
```

Теперь, вместо того, чтобы использовать реальную http-библиотеку, присвоенную в `Vue.prototype.$http`, будет взята наша мок реализация. Это хорошо тем, что мы можем контролировать окружение теста и получать одинаковый результат.

Запустив `yarn test:unit`, наш тест не пройдёт проверку: 


```bash
FAIL  tests/unit/FormSubmitter.spec.js
  ● FormSubmitter › Показывает сообщение после отправки

    [vue-test-utils]: find did not return .message, cannot call text() on empty Wrapper
```

Получилось так, что тест завершился _перед_ тем, как вернулся промис от `mockHttp`. Мы можем сделать наш тест асинхронным следующим способом:

```js
it("Показывает сообщение после отправки", async () => {
  // ...
})
```

Тем не менее, тест всё ещё завершается перед тем, как промис зарезолвился. Один из способов решения данной проблемы – это использование [flush-promises](https://www.npmjs.com/package/flush-promises), небольшого Node.js модуля, который немедленно резолвит все промисы в режиме ожидания(pending).
Установим модуль, написав `yarn add flush-promises`, и обновим наш тест следующим образом:

```js
import flushPromises from "flush-promises"
// ...

it("Показывает сообщение после отправки", async () => {
  const wrapper = shallowMount(FormSubmitter, {
    mocks: {
      $http: mockHttp
    }
  })

  wrapper.find("[data-username]").setValue("Алиса")
  wrapper.find("form").trigger("submit.prevent")

  await flushPromises()

  expect(wrapper.find(".message").text())
    .toBe("Спасибо за ваше сообщение, Алиса.")
})
```

Теперь тест проходит проверку. Исходный код `flush-promises` занимает около 10 строк, если вам интересен Node.js, то обязательно ознакомьтесь с тем, как это работает.

Нам также нужно убедиться, что endpoint и переданные данные правильны. Добавим ещё две проверки в тест:

```js
// ...
expect(url).toBe("/api/v1/register")
expect(data).toEqual({ username: "Алиса" })
```

Тест все ещё проходит проверки.

## Заключение

В этой секции мы научились, как:
- использовать `trigger` для событий, даже если используются такие модификаторы, как `prevent`
- использовать `setValue`, чтобы устанавливать значение для `<input>`, который используют `v-model`
- писать тесты, придерживаясь трёх ступеней юнит-тестирования
- мокать методы из `Vue.prototype`, используя `mocks` при монтировании
- использовать `flush-promises`, чтобы немедленно резолвить все промисы в режиме ожидания. Полезная техника в юнит-тестировании

Исходный код для тестов на этой страниц можно найти [здесь](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/FormSubmitter.spec.js).
