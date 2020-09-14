:::tip Это руководство было написано для Vue.js 2 и Vue Test Utils v1.
Версия для Vue.js 3 [здесь](/v3/ru).
:::

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
import { mount } from "@vue/test-utils"
import FormSubmitter from "@/components/FormSubmitter.vue"

describe("FormSubmitter", () => {
  it("Показывает сообщение после отправки", async () => {
    const wrapper = mount(FormSubmitter)

    await wrapper.find("[data-username]").setValue("Алима")
    await wrapper.find("form").trigger("submit.prevent")

    expect(wrapper.find(".message").text())
      .toBe("Спасибо за ваше сообщение, Алиса.")
  })
})
```

Этот тест достаточно понятен. Мы используем `mount` для компонента, устанавливаем значение и применяем `trigger` метод из `vue-test-utils`, который симулирует пользовательский ввод. `trigger` также работает с пользовательскими событиями и с их модификаторами, например, `submit.prevent`, `keydown.enter` и так далее.

Обратите внимание, когда мы вызываем `setValue` и `trigger`, мы используем `await`. Вот почему нам пришлось пометить тест как `async` – чтобы мы могли использовать `await`.

`setValue` и` trigger` внутри возвращают `Vue.nextTick ()`. Начиная с бета-версии 28 `vue-test-utils`, вам нужно вызвать` nextTick`, чтобы система реактивности Vue обновила DOM. Выполняя `await setValue (...)` и `await trigger (...)`, вы на самом деле просто используете сокращение для:

```js
wrapper.setValue(...)
await wrapper.vm.$nextTick() // "Ждём пока обновится DOM, перед тем как продолжить тестирование" 
```

Иногда вы можете тестировать, не дожидаясь `nextTick`, но если ваши компоненты начинают усложняться, вы можете попасть в состояние гонки, и ваша проверка может выполняться до того, как Vue обновит DOM. Вы можете узнать больше об этом в официальной [документации vue-test-utils](https://vue-test-utils.vuejs.org/ru/guides/#%D1%82%D0%B5%D1%81%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5-%D0%B0%D1%81%D0%B8%D0%BD%D1%85%D1%80%D0%BE%D0%BD%D0%BD%D0%BE%D0%B9-n%D0%BE%D0%B3%D0%B8%D0%BA%D0%B8).

Этот тест также следует трём этапам модульного тестирования:

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

В этом случае, одним из способов тестирования является _мок_ для `this.$http`, чтобы создать желанную среду для тестирования. Подробнее об опциях `mocks` можно почитать [здесь](https://vue-test-utils.vuejs.org/ru/api/options.html#mocks). Давайте посмотрим на мок `http.get` метода:

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

Сначала, добавим наверху мок реализацию `this.$http`, прямо перед блоком `describe`:

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
  const wrapper = mount(FormSubmitter, {
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

Теперь нам нужно убедиться, что DOM обновлен и все промисы выполнены, прежде чем тест продолжится. `await wrapper.setValue (...)` здесь тоже не всегда надежен, потому что в этом случае мы не ждем, пока Vue обновит DOM, а ожидаем, что внешняя зависимость (в данном случае наш выдуманный HTTP-клиент) зарезолвится.

Один из способов решения данной проблемы – это использование [flush-promises](https://www.npmjs.com/package/flush-promises), небольшого Node.js модуля, который немедленно резолвит все промисы в режиме ожидания (pending). Установите его с помощью `yarn add flush-promises` и обновите тест следующим образом (мы также добавляем `await wrapper.setValue (...)` для надёжности):

```js
import flushPromises from "flush-promises"
// ...

it("Показывает сообщение после отправки", async () => {
  const wrapper = mount(FormSubmitter, {
    mocks: {
      $http: mockHttp
    }
  })

  await wrapper.find("[data-username]").setValue("Алиса")
  await wrapper.find("form").trigger("submit.prevent")

  await flushPromises()

  expect(wrapper.find(".message").text())
    .toBe("Спасибо за ваше сообщение, Алиса.")
})
```

Теперь тест проходит проверку. Исходный код `flush-promises` занимает около 10 строк, если вам интересен Node.js, то обязательно ознакомьтесь с тем, как это работает.

Нам также нужно убедиться, что endpoint и переданные данные правильные. Добавим ещё две проверки в тест:

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
- использовать `await` в паре с `trigger` и `setValue` с `await Vue.nextTick`, чтобы убедиться, что DOM обновился
- писать тесты, придерживаясь трёх ступеней модульного тестирования
- мокать методы из `Vue.prototype`, используя `mocks` при монтировании
- использовать `flush-promises`, чтобы немедленно резолвить все промисы в режиме ожидания. Полезная техника в модульном тестировании

Исходный код для тестов на этой странице можно найти [здесь](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/FormSubmitter.spec.js).
