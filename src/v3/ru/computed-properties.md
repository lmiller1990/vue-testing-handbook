:::tip Это руководство было написано для Vue.js 3 и Vue Test Utils v2.
Версия для Vue.js 2 [здесь](/ru).
:::

## Тестирование вычисляемых свойств

Тест, описанный на этой странице, вы можете найти [здесь](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app-vue-3/tests/unit/NumberRenderer.spec.js).

Тестировать вычисляемые свойства обычно просто, так как это старые добрые JavaScript функции.

Давайте рассмотрим два разных способа тестирования вычисляемых свойств. Создадим компонент `<NumberRenderer>`, который выводит чётные и нечётные числа, в зависимости от вычисляемого свойства `numbers`. 

## Написание теста

Компонент `<NumberRenderer>` получает на вход параметр `even` типа `boolean`. Если `even` в значении `true`, тогда компонент должен отрисовать 2, 4, 6 и 8. Если в значении `false`, тогда 1, 3, 5, 7 и 9. Список значений будет высчитываться в вычисляемом свойстве `numbers`.

## Тестирование отрисовки значений

Тест выглядит так:

```js
import { mount } from "@vue/test-utils"
import NumberRenderer from "@/components/NumberRenderer.vue"

describe("NumberRenderer", () => {
  it("выводит чётные числа", () => {
    const wrapper = mount(NumberRenderer, {
      props: {
        even: true
      }
    })

    expect(wrapper.text()).toBe("2, 4, 6, 8")
  })
})
```

Перед запуском теста, давайте добавим компонент `<NumberRenderer>`:

```vue
<template>
  <div>
  </div>
</template>

<script>
export default {
  name: "NumberRenderer",

  props: {
    even: {
      type: Boolean,
      required: true
    }
  }
}
</script>
```

Теперь можем начинать разработку, пускай ошибки подсказывают нам, что делать. `yarn test:unit` выведет:

```bash
● NumberRenderer › выводит чётные числа

  expect(received).toBe(expected) // Object.is equality

  Expected: "2, 4, 6, 8"
  Received: ""
```

Выглядит так, что всё работает правильно. Давайте реализуем `numbers`:

```js
computed: {
  numbers() {
    const evens = []

    for (let i = 1; i < 10; i++) {
      if (i % 2 === 0) {
        evens.push(i)
      }
    }

    return evens
  }
}
```

И обновим шаблон, чтобы использовать новое вычисляемое свойство:

```html
<template>
  <div>
    {{ numbers }}
  </div>
</template>
```

`yarn test:unit` теперь выводит:

```bash
FAIL  tests/unit/NumberRenderer.spec.js
● NumberRenderer › выводит чётные числа

  expect(received).toBe(expected) // Object.is equality

  Expected: "2, 4, 6, 8"
  Received: "[
    2,
    4,
    6,
    8
  ]"
```

Числа правильные, но мы хотим выводить их отформатированными. Давайте обновим значение `return`.

```js
return evens.join(", ")
```

Теперь `yarn test:unit` проходит проверку! 

## Тестирование через `call` 

Теперь добавим тесты для случая, когда `even: false`. В этот раз мы попробуем альтернативный способ тестирования вычисляемых свойств без отрисовки компонента.

Первым делом, напишем тест:

```js
it("выводит нечётные числа", () => {
  const localThis = { even: false }

  expect(NumberRenderer.computed.numbers.call(localThis)).toBe("1, 3, 5, 7, 9")
})
```

Вместо того, чтобы отрисовывать компонент и делать проверку через `wrapper.text()`, мы используем `call`, чтобы передать другой контекст `this` в `numbers`. Также посмотрим, что случится, если мы не будем использовать `call`, но уже после того, как все тесты пройдут проверку.

Запуск текущего теста выведет:

```bash
FAIL  tests/unit/NumberRenderer.spec.js
● NumberRenderer › выводит нечётные числа

  expect(received).toBe(expected) // Object.is equality

  Expected: "1, 3, 5, 7, 9"
  Received: "2, 4, 6, 8"
```

Обновим `numbers`:


```js
numbers() {
  const evens = []
  const odds = []

  for (let i = 1; i < 10; i++) {
    if (i % 2 === 0) {
      evens.push(i)
    } else {
      odds.push(i)
    }
  }

  return this.even === true ? evens.join(", ") : odds.join(", ")
}
```

Теперь оба теста проходят проверку. Но что, если мы не будем использовать `call` во втором тесте? Попробуйте обновить тест вот так:

```js
it("выводит нечётные числа", () => {
  const localThis = { even: false }

  expect(NumberRenderer.computed.numbers()).toBe("1, 3, 5, 7, 9")
})
```

Теперь тест падает:

```bash
FAIL  tests/unit/NumberRenderer.spec.js
● NumberRenderer › выводит нечётные числа

  expect(received).toBe(expected) // Object.is equality

  Expected: "1, 3, 5, 7, 9"
  Received: "2, 4, 6, 8"
```

`vue` автоматически связывает `props` и `this`. Мы не отрисовываем компонент через `mount`, поэтому Vue не привязывает что-либо к `this`. Если вы сделаете `console.log(this)`, то увидите, что контекст - это просто объект `computed`.

```js
{ numbers: [Function: numbers] }
```

Поэтому нам нужно использовать `call`, который позволяет нам связывать контекст `this`, в нашем случае, со свойством `even`.

## Использовать `call` или `shallowMount`?

Оба способа полезны при тестировании вычисляемых свойств. Call может быть полезен, когда:

- Вы тестируете компонент, который выполняет какие-либо действия в хуках жизненного цикла и вы хотите их избежать.
- Вы хотите использовать заглушки для некоторых значений в `this`. Использовать `call` и передавать свой контекст может быть полезным.

Конечно вы хотите убедиться, что значения отрисовываются верно, поэтому убедитесь, что вы выбрали правильный способ и тест покрывает все возможные случаи.

## Заключение

- вычисляемые свойства могут тестироваться с использованием `mount`, делая проверку на отрисованную разметку
- сложные вычисляемые свойства могут тестироваться независимо, используя `call`
