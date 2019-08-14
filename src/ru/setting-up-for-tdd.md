## Установка vue-cli

`vue-test-utils` – официальная библиотека для тестированию vue-компонентов. Она работает как в браузере, так и в среде Node.js, также позволяет работать в связке с любым тест-ранером. Мы будем запускать тесты через Node.js.

`vue-cli` – самый простой способ начать работу. Он установит всё необходимое для проекта, сконфигурирует Jest – популярный фреймворк для тестирования. Установим cli, написав в консоле:

```sh
yarn global add @vue/cli
```

или через npm:

```sh
npm install -g @vue/cli
```

Создадим новый проект, написав `vue create [project-name]`. Выберем "Manually select features" и для "Unit Testing" указываем Jest.

Как только установка закончится, переходим в проект через `cd` и запускаем `yarn test:unit`. Если всё сделано правильно, вы увидите:

```
 PASS  tests/unit/example.spec.js
  HelloWorld.vue
    ✓ renders props.msg when passed (14ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        1.79s
```

Поздравляю, вы только что запустили свой первый тест!

## Пишем первый тест

Мы запускали тест, который установился вместе с проектом. Теперь давайте напишем собственный компонент и тест к нему. По традиции, когда работают по TDD, вы сначала пишите тесты, которые не пройдут проверку, затем пишите код, который позволит тестам пройти её. Для начала, создадим наш компонент.

Нам больше не нужен `src/components/HelloWorld.vue` и `tests/unit/example.spec.js`, поэтому удалим их.

## Создаём компонент `Greeting`

Создадим `Greeting.vue` в `src/components`. Внутри `Greeting.vue`, добавим следующее:

```vue
<template>
  <div>
    {{ greeting }}
  </div>
</template>

<script>
export default {
  name: "Greeting",

  data() {
    return {
      greeting: "Vue and TDD"
    }
  }
}
</script>
```

## Написание теста

`Greeting` делает только одну вещь - выводит значение `greeting`. Стратегия будет такая:

1. отрисовываем компонент через `mount`
2. проверяем, что `component` содержит в себе значение "Vue and TDD"

Создадим `Greeting.spec.js` внутри `tests/unit`. Затем импортируем `Greeting.vue` и `mount`, добавим разметку для теста:

```
import { mount } from '@vue/test-utils'
import Greeting from '@/components/Greeting.vue'

describe('Greeting.vue', () => {
  it('renders a greeting', () => {

  })
})
```
Существует несколько различных синтаксисов, используемых при TDD. Мы будем использовать `describe` и `it` – синтаксис, который используется в Jest. В `describe` обычно пишут что именно тестируют, в нашем случае `Greeting.vue`. В `it` содержится функция, которая проверяет конкретную часть кода. Для каждой функции компонента, мы добавляем свой блок с `it`.

Теперь нам нужно отрисовать компонент с помощью `mount`. Обычно компонент присваивают какой-либо переменной, которую называют `wrapper`. Также выведем содержание компонента, убедимся, что всё запускается правильно.

```js
const wrapper = mount(Greeting)

console.log(wrapper.html())
```

## Запускаем тест

Запустим тест, написав в консоле `yarn test:unit`. Все файлы из папки `tests` c расширением `.spec.js` автоматически выполнятся. Если всё сделано правильно, вы увидите:

```
PASS  tests/unit/Greeting.spec.js
Greeting.vue
  ✓ renders a greeting (27ms)

console.log tests/unit/Greeting.spec.js:7
  <div>
    Vue and TDD
  </div>
```

Как мы видим, разметка компонента правильная, тест прошёл. Такой тест никогда не упадёт, поэтому он не очень полезный. Даже если мы удалим `greeting` из `Greeting.vue`, тест всё равно пройдёт. Давайте поправим это.

## Добавление проверки

Нам нужно сделать проверку, чтобы убедиться, что компонент ведёт себя так, как нужно. Мы можем сделать это через Jest's `expect` API. Оно выглядит так: `expect(текущий результат).to [матчер] (ожидаемый результат)`

_Матчер_ – это функция, которая сравнивает значения. Например:

```js
expect(1).toBe(1)
```

Полный список матчеров можно посмотреть в [документации Jest](http://jestjs.io/docs/en/expect). Во `vue-test-utils` нет матчеров, но нам достаточно тех, что предоставляет Jest. Нам нужно сравнить текст в `Greeting`. Мы можем написать:

```js
expect(wrapper.html().includes("Vue and TDD")).toBe(true)
```

но `vue-test-utils` предоставляет еще лучший способ - `wrapper.text`. Давайте допишем нам тест:

```js
import { mount } from '@vue/test-utils'
import Greeting from '@/components/Greeting.vue'

describe('Greeting.vue', () => {
  it('renders a greeting', () => {
    const wrapper = mount(Greeting)

    expect(wrapper.text()).toMatch("Vue and TDD")
  })
})
```

Нам больше не нужен `console.log`, удалим его. Запустим тесты `yarn unit:test` и если всё сделано правильно, у вас должно получиться:

```
PASS  tests/unit/Greeting.spec.js
Greeting.vue
  ✓ renders a greeting (15ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        1.477s, estimated 2s
```

Выглядит отлично. Но вы должно всегда видеть, что тест сначала не проходит проверку, а затем проходит, чтобы убедиться, что всё работает правильно. В традиционном TDD, вы сначала пишите не работающие тесты, затем используете полученные ошибки при написании кода. Давайте убедимся, что всё работает правильно. Обновим Greeting.vue`:

```vue
<template>
  <div>
    {{ greeting }}
  </div>
</template>

<script>
export default {
  name: "Greeting",

  data() {
    return {
      greeting: "Vue without TDD"
    }
  }
}
</script>
```

Запустим тесты через `yarn test:unit`:

```
FAIL  tests/unit/Greeting.spec.js
Greeting.vue
  ✕ renders a greeting (24ms)

● Greeting.vue › renders a greeting

  expect(received).toMatch(expected)

  Expected value to match:
    "Vue and TDD"
  Received:
    "Vue without TDD"

     6 |     const wrapper = mount(Greeting)
     7 |
  >  8 |     expect(wrapper.text()).toMatch("Vue and TDD")
       |                            ^
     9 |   })
    10 | })
    11 |

    at Object.<anonymous> (tests/unit/Greeting.spec.js:8:28)
```

Jest даёт нам хороший фидбек. Мы видим ожидаемый и полученный результат, а также строку, в которой произошла ошибка. Тест не прошел проверку, как и ожидалось. Вернем прежнее значение в Greeting.vue` и убедимся, что тест снова проходит проверку.

В следующих блоках мы рассмотрим два метода отрисовки, которые предоставляет `vue-test-utils` – это `mount` и `shallowMount`.
