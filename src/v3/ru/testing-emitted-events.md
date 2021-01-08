:::tip Это руководство было написано для Vue.js 3 и Vue Test Utils v2.
Версия для Vue.js 2 [здесь](/ru).
:::

## Тестирования пользовательских событий

С ростом приложения растёт количество компонентов. Когда им нужно общаться между собой, дочерний компонент может [породить событие](https://ru.vuejs.org/v2/api/index.html#vm-emit), а родитель ответить на него.

`vue-test-utils` предоставляет `emitted` API, который позволит нам сделать проверку на пользовательские события. Документацию для `emitted` можно найти [здесь](https://vue-test-utils.vuejs.org/ru/api/wrapper/emitted.html).

Исходный код для тестов на этой странице можно взять [тут](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app-vue-3/tests/unit/Emitter.spec.js).

## Написание компонента и теста к нему

Давайте сделаем простой компонент. Назовём его `<Emitter>` и добавим следующий код:

```vue
<template>
  <div>
  </div>
</template>

<script>
  export default {
    name: "Emitter",

    methods: { 
      emitEvent() {
        this.$emit("myEvent", "name", "password")
      }
    }
  }
</script>
```

Тест назовём `emitEvent`:

```js
import Emitter from "@/components/Emitter.vue"
import { mount } from "@vue/test-utils"

describe("Emitter.vue", () => {
  it("Порождает событие с двумя аргументами", () => {
    const wrapper = mount(Emitter)

    wrapper.vm.emitEvent()

    console.log(wrapper.emitted())
  })
})
```

Используя [emitted API](https://vue-test-utils.vuejs.org/ru/api/wrapper/emitted.html), предоставленный нам `vue-test-utils`, мы можем с лёгкостью посмотреть все порождённые события.

Запустим тест, написав `yarn test:unit`.

```bash
PASS  tests/unit/Emitter.spec.js
● Console

  console.log tests/unit/Emitter.spec.js:10
    { myEvent: [ [ 'name', 'password' ] ] }
```

## Синтаксис emitted

`emitted` возвращает объект. Порождённые события сохраняются, как свойства объекта. Вы можете проверять события, используя `emitted().[event]`:

```js
emitted().myEvent //=>  [ [ 'name', 'password' ] ]
```

Давайте попробуем вызвать `emitEvent` дважды:

```js
it("Порождает событие с двумя аргументами", () => {
  const wrapper = mount(Emitter)

  wrapper.vm.emitEvent()
  wrapper.vm.emitEvent()

  console.log(wrapper.emitted().myEvent)
})
```

Запустим тест, написав `yarn test:unit`.

```bash
console.log tests/unit/Emitter.spec.js:11
  [ [ 'name', 'password' ], [ 'name', 'password' ] ]
```

`emitted().emitEvent` возвращает массив. Первый экземпляр `emitEvent` можно достать через `emitted().emitEvent[0]`. Аргументы получают похожим синтаксисом: `emitted().emitEvent[0][0]` и так далее.

Давайте сделаем реальную проверку для порождённых событий:

```js
it("Порождает событие с двумя аргументами", () => {
  const wrapper = mount(Emitter)

  wrapper.vm.emitEvent()

  expect(wrapper.emitted().myEvent[0]).toEqual(["name", "password"])
})
```

Тест проходит проверку.

## Тестирование событий без монтирования компонента

Иногда может потребоваться протестировать пользовательские события без монтирования компонента. Этого можно достичь, используя `call`. Давайте напишем ещё один тест.

```js
it("Порождает событие без монтирования компонента", () => {
  const events = {}
  const $emit = (event, ...args) => { events[event] = [...args] }

  Emitter.methods.emitEvent.call({ $emit })

  expect(events.myEvent).toEqual(["name", "password"])
})
```

Так как `$emit` – обычный JavaScript объект, мы может замокать `$emit` и использовать `call`, чтобы прикрепить его к контексту `this` из `emitEvent`. Используя `call`, вы также можете вызывать методы без монтирования компонента.

Использовать `call` может быть полезно в ситуациях, где есть несколько тяжёлых функций в хуках жизненного цикла `created` или `mounted`, и вы не хотите их выполнять. Так как вы не монтируете компонент, функции из хуков никогда не выполнятся. 
Также `call` полезен при манипулировании контекстом `this`.

Как правило, вы не хотите вызывать метод вручную, как мы это делаем здесь – если ваш компонент генерирует событие при нажатии кнопки, то вы, вероятнее всего, захотите выполнить `wrapper.find ('button').сlick()`. Эта статья просто демонстрация других техник.


## Заключение

- `emitted` API из `vue-test-utils` используется, чтобы проверять пользовательские события
- `emitted` - это метод возвращающий объект, в свойствах которого находятся порождённые события
- каждое свойство из `emitted` является массивом. Чтобы достать экземпляр пользовательских событий, можно использовать синтаксис массивов `[0]`, `[1]`
- аргументы для пользовательских событий также сохраняются в виде массивов, которые можно взять, используя `[0]`, `[1]`.
- `$emit` можно замокать, используя `call`. Проверки можно делать без монтирования компонента

Исходный код для тестов на этой странице можно взять [тут](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app-vue-3/tests/unit/Emitter.spec.js).
