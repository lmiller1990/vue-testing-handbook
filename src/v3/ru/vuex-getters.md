:::tip Это руководство было написано для Vue.js 3 и Vue Test Utils v2.
Версия для Vue.js 2 [здесь](/ru).
:::

## Тестирование геттеров

Тестировать геттеры в изоляции достаточно просто, так как это обычные JavaScript функции. Техника очень похожа на тестирование мутаций и действий, больше информации [здесь](https://lmiller1990.github.io/vue-testing-handbook/ru/vuex-mutations.html).

Исходный код для теста на этой странице можно найти [здесь](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app-vue-3/tests/unit/getters.spec.js).

Мы рассмотрим два геттера, которые работают с хранилищем, выглядящим так:

```js
const state = {
  dogs: [
    { name: "Лаки", breed: "пудель", age: 1 },
    { name: "Песик", breed: "далматинец", age: 2 },
    { name: "Блэки", breed: "пудель", age: 4 }
  ]
}
```

Геттеры, которые будем тестировать:

1. `poodles`: получаем всех пуделей
2. `poodlesByAge`: получаем всех пуделей определённого возраста

## Создание геттеров

Давайте сначала сделаем геттеры: 

```js
export default {
  poodles: (state) => {
    return state.dogs.filter(dog => dog.breed === "пудель")
  },

  poodlesByAge: (state, getters) => (age) => {
    return getters.poodles.filter(dog => dog.age === age)
  }
}
```

Ничего особенного – помните, что геттеры принимают другие геттеры вторым аргументом. Так как у нас уже есть геттер `poodles`, мы можем использовать его в `poodlesByAge`. Возвращая функцию в `poodlesByAge`, принимающую аргумент, мы можем передать аргументы в геттеры. Геттер `poodlesByAge` можно использовать так:

```js
computed: {
  puppies() {
    return this.$store.getters.poodlesByAge(1)
  }
}
```

Начнём с тестирования `poodles`.

## Написание тестов

Так как геттер – это обычная JavaScript функция, которая принимает объект `state` первым аргументом, тестировать будет достаточно просто. Я буду писать тест в файле `getters.spec.js` со следующим кодом:

```js
import getters from "../../src/store/getters.js"

const dogs = [
  { name: "Лаки", breed: "пудель", age: 1 },
  { name: "Песик", breed: "далматинец", age: 2 },
  { name: "Блэки", breed: "пудель", age: 4 }
]
const state = { dogs }

describe("poodles", () => {
  it("возвращает пуделей", () => {
    const actual = getters.poodles(state)

    expect(actual).toEqual([ dogs[0], dogs[2] ])
  })
})
```

Vuex автоматически передаёт `state` в геттер, но так как мы тестируем геттеры в изоляции, нужно передавать `state` вручную. Кроме того, мы тестируем обычную функцию JavaScript.

`poodlesByAge` немного интереснее. Вторым аргументом является другие геттеры. Мы тестируем `poodlesByAge`, поэтому не хотим реализовывать `poodles`. Вместо этого, мы можем использовать заглушку для `getters.poodles`. Это даст нам больше контроля над тестом.

```js
describe("poodlesByAge", () => {
  it("возвращет пуделей по возрасту", () => {
    const poodles = [ dogs[0], dogs[2] ]
    const actual = getters.poodlesByAge(state, { poodles })(1)

    expect(actual).toEqual([ dogs[0] ])
  })
})
```

Вместо передачи настоящего геттера `poodles`, мы передаём результат, который бы он вернул. Мы уже знаем, что он работает, так как тест написан. Это позволяет нам сфокусироваться на тестировании уникальной логики `poodlesByAge`.

Есть возможность делать `async` геттеры. Они тестируются так же, как и `async` действия, о которых можно прочитать [здесь](https://lmiller1990.github.io/vue-testing-handbook/ru/vuex-actions.html).

## Заключение

- `getters` – это обычные JavaScript функции
- При тестировании геттеров в изоляции, нужно передавать хранилище вручную
- Если геттер использует другой геттер, вы должны использовать заглушку, которая возвращает ожидаемый результат. Это даст больше контроля над тестом и позволит сфокусироваться на тестировании рассматриваемого геттера

Исходный код для теста на этой странице можно найти [здесь](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app-vue-3/tests/unit/getters.spec.js).
