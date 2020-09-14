:::tip Это руководство было написано для Vue.js 3 и Vue Test Utils v2.
Версия для Vue.js 2 [здесь](/ru).
:::

## Мокаем глобальные объекты

`vue-test-utils` позволяет с лёгкостью мокать глобальные объекты, прикреплённые к `Vue.prototype` внутри теста, а также устанавливать стандартные значения мока для всех тестов.

Тест, использованный в последующем примере, можно найти [здесь](https://github.com/lmiller1990/vue-testing-handbook/blob/master/demo-app-vue-3/tests/unit/Bilingual.spec.js).

## Моки опций монтирования

Один из способов установить значение любого свойства из `Vue.prototype` – использовать [моки опций монтирования](https://vue-test-utils.vuejs.org/ru/api/options.html#mocks). Обычно прототип включает в себя:
- `$store`, для Vuex
- `$router`, для Vue Router
- `$t`, для vue-i18n

и множество других.


## Пример с vue-i18n

Примеры использования с Vuex и Vue Router описаны в соответствующих секциях: [тут](https://lmiller1990.github.io/vue-testing-handbook/ru/vuex-in-components.html#testing-vuex-in-components) и [тут](https://lmiller1990.github.io/vue-testing-handbook/ru/vue-router.html#vue-router). Давайте посмотрим на пример с [vue-i18n](https://github.com/kazupon/vue-i18n). Использовать `createLocalVue` и устанавливать `vue-i18n` для каждого теста быстро надоест, а код будет шаблонный. Сперва сделаем компонент `<Bilingual>`, который использует `vue-i18n`:

```vue
<template>
  <div class="hello">
    {{ $t("helloWorld") }}
  </div>
</template>

<script>
  export default {
    name: "Bilingual"
  }
</script>
```

`vue-i18n` работает следующим образом: вы пишите переводы в другом файле, а затем обращаетесь к ним через `$t`. Для данного теста не важно, как выглядит файл с переводом, пусть будет примерно такой: 

```js
export default {
  "en": {
    helloWorld: "Hello world!"
  },
  "ja": {
    helloWorld: "こんにちは、世界！"
  }
}
```

Основываясь на локали, будет отрисовываться правильный перевод. Давайте попробуем отрендерить компонент, не используя моков в тесте.

```js
import { mount } from "@vue/test-utils"
import Bilingual from "@/components/Bilingual.vue"

describe("Bilingual.vue", () => {
  it("Успешно отрисовывается", () => {
    const wrapper = mount(Bilingual)
  })
})
```

Запуск тестов через `yarn test:unit` выдаст нам огромную трассировку стека. Если посмотреть внимательно, вы увидите:

```bash
"TypeError: _ctx.$t is not a function"
```

Это потому, что мы не установили `vue-i18n`, поэтому глобального метода `$t` не существует. Давайте замокаем его, используя опцию монтирования `mocks`.

```js
import { mount } from "@vue/test-utils"
import Bilingual from "@/components/Bilingual.vue"

describe("Bilingual.vue", () => {
  it("Успешно отрисовывается", () => {
    const wrapper = mount(Bilingual, {
      global: {
        mocks: {
          $t: (msg) => msg
        }
      }
    })
  })
})
```

Теперь тест проходит проверку! Есть ещё много примеров использования опции `mocks`. Чаще всего я использую её для моков глобальных объектов, описанных выше.

## Установка стандартных моков, используя конфигурации

Иногда вам может понадобиться стандартное значение для мока, в таком случае не придётся создавать его для каждого теста. Вы можете сделать это, используя [конфигурацию](https://vue-test-utils.vuejs.org/ru/api/#%D0%BA%D0%BE%D0%BD%D1%84%D0%B8%D0%B3%D1%83%D1%80%D0%B0%D1%86%D0%B8%D1%8F) из `vue-test-utils`. Давайте расширим наш пример с `vue-i18n`. Вы можете устанавливать стандартные моки где угодно, сделав следующее:

```js
import { config } from "@vue/test-utils"

config.global.mocks = {
  mock: "Стандартное значение мока"
}
```

Демо проект для этого руководства использует Jest, поэтому я установлю стандартные моки в `jest.init.js`, который подгружается перед запуском тестов. Я также импортирую объект с переводом, который мы делали ранее, и использую его для реализации мока.

```js
import { config } from "@vue/test-utils"
import VueTestUtils from "@vue/test-utils"
import translations from "./src/translations.js"

const locale = "en"

config.global.mocks = {
  $t: (msg) => translations[locale][msg]
}
```

Теперь отрисуется настоящий перевод, несмотря на использование мока для функции `$t`. Запустим тест ещё, используя в этот раз `console.log` на `wrapper.html()`, а также уберём `mocks` из опции монтирования.

```js
describe("Bilingual.vue", () => {
  it("Успешно отрисовывается", () => {
    const wrapper = mount(Bilingual)

    console.log(wrapper.html())
  })
})
```

Тест проходит проверку и отрисовывает следующую разметку:

```html
<div class="hello">
  Hello world!
</div>
```

Как использовать `mocks` при тестировании Vuex можно прочитать [здесь](https://lmiller1990.github.io/vue-testing-handbook/v3/ru/vuex-in-components.html#testing-vuex-in-components). Техника одна и та же.

## Заключение

В этом руководстве обсудили:

- как использовать `global.mocks` для моков глобальных объектов внутри тестов
- как использовать `config.global.mocks` для установки стандартных значений для мока
