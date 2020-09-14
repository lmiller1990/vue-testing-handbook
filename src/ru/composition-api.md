:::tip Это руководство было написано для Vue.js 2 и Vue Test Utils v1.
Версия для Vue.js 3 [здесь](/v3/ru).
:::

## The Composition API

Vue 3 предоставит новое API для создания компонентов – [Composition API](https://vue-composition-api-rfc.netlify.com/#basic-example). Для сбора отзывов от пользователей, команда Vue выложила плагин, который позволяет попробовать это API во Vue 2. Вы можете найти его [здесь](https://github.com/vuejs/composition-api).

Тестирование компонента, созданного с помощью Composition API ничем не должно отличаться от тестирования обычного компонента, так как мы тестируем не реализацию, а поведение, то что будет на выходе. (*что* делает компонент, а не *как* он это делает). В этой статье будет разобран пример небольшого компонента, использующего Composition API во Vue 2, и то, как похоже тестирование такого компонента в сравнении с обычным.

Исходный код для тестов на этой странице можно найти [здесь](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/CompositionApi.spec.js).

## Компонент

Ниже можно увидеть базовый пример Composition API. Если вы что-то не понимаете, [прочитайте RFC](https://vue-composition-api-rfc.netlify.com/) или воспользуетесь гуглом; есть множество ресурсов про Composition API.

```html
<template>
  <div>
    <div class="message">{{ uppercasedMessage }}</div>
    <div class="count">
      Счётчик: {{ state.count }}
    </div>
    <button @click="increment">Увеличить</button>
  </div>
</template>

<script>
import Vue from 'vue'
import VueCompositionApi from '@vue/composition-api'

Vue.use(VueCompositionApi)

import { 
  reactive,
  computed
} from '@vue/composition-api'

export default {
  name: 'CompositionApi',

  props: {
    message: {
      type: String
    }
  },

  setup(props) {
    const state = reactive({
      count: 0
    })

    const increment = () => {
      state.count += 1
    }

    return {
      state,
      increment,
      uppercasedMessage: computed(() => props.message.toUpperCase())
    }
  }
}
</script>
```

Здесь нам нужно протестировать две вещи:

1. Увеличивается ли `state.count` на 1 при клике на кнопку "Увеличить"?

2. Верно ли отрисовывается сообщение из входных параметров (трансформируется в верхний регистр)?

## Тестирование сообщения из входных параметров

Тестирование правильно ли отрисовалось сообщение – банально. Мы просто используем `propsData` для установки значения параметра как описано [здесь](/ru/components-with-props.html).

```js
import { mount } from "@vue/test-utils"

import CompositionApi from "@/components/CompositionApi.vue"

describe("CompositionApi", () => {
  it("отрисовывает сообщение", () => {
    const wrapper = mount(CompositionApi, {
      propsData: {
        message: "Тестируем composition API"
      }
    })

    expect(wrapper.find(".message").text()).toBe("ТЕСТИРУЕМ COMPOSITION API")
  })
})
```

Как и ожидалось, это было очень просто – несмотря на то, что мы применили composition компонент, API для тестирования и сам подход не поменялся. Вы можете полностью поменять реализацию, но тесты трогать не придётся. Помните – нужно тестировать данные на выходе (обычно это отрисованный HTML) на основе переданных входных данных (входные параметры, пользовательские события), а не реализацию.

## Тестирование клика по кнопке

Написание теста, гарантирующего увеличение `state.count` при клике на кнопку – также просто. Обратите внимание, что в тесте используется `async`; о том, зачем это здесь необходимо читайте в главе [симулирование пользовательского ввода](/ru/simulating-user-input.html#writing-the-test).

```js
import { mount } from "@vue/test-utils"

import CompositionApi from "@/components/CompositionApi.vue"

describe("CompositionApi", () => {
  it("увеличивает счётчик при клике на кнопку", async () => {
    const wrapper = mount(CompositionApi, {
      propsData: { message: '' }
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.find(".count").text()).toBe("Счётчик: 1")
  })
})
```
Опять не очень интересно – мы `триггерим` событие клика и проверяем, что счётчик увеличился.

## Заключение

В статье продемонстрировалось как тестирование компонента с использованием Composition API ничем не отличает от тестирования обычного компонента. Идеи и концепты одни и те же. Главное, что нужно понять – мы пишем тест и делаем проверки на основе входящих и выходящих данных.

Должна быть предусмотрена возможность рефакторинга обычных компонентов на компоненты с Composition API без надобности изменений тестов. Если вы обнаружили, что нужно переписывать тесты при рефакторинге – вероятней всего вы тестируете *реализацию*, а не данные на выходе.

Несмотря на новые интересные возможности, которые даёт Composition API, совсем не обязательно его использовать прямо сейчас. Однако не зависимо от вашего выбора, помните, что хорошие модульные тесты проверяют конечное состояние компонента и не учитывают детали реализации.
