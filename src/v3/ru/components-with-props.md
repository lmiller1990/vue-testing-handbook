:::tip Это руководство было написано для Vue.js 3 и Vue Test Utils v2.
Версия для Vue.js 2 [здесь](/ru).
:::

## Добавляем входные параметры

`props` может использоваться как с `mount`, так и с `shallowMount`. Данный метод часто используют при тестировании входных параметров, которые компонент получает от своего родителя.

`props` передаётся вторым аргументом в `shallowMount` или `mount` следующим образом:

```js
const wrapper = mount(Foo, {
  props: {
    foo: 'bar'
  }
})
```

## Создаём компонент

Добавим небольшой компонент `<SubmitButton>`, который принимает на вход параметры `msg` и `isAdmin`. В зависимости от `isAdmin` компонент будет содержать `<span>` в одном из двух состояний:

* `Не авторизован`, если `isAdmin` в значении `false` (или не передан)
* `Привилегии администратора`, если `isAdmin` в значении `true`

```vue
<template>
  <div>
    <span v-if="isAdmin">Привилегии администратора</span>
    <span v-else>Не авторизован</span>
    <button>
      {{ msg }}
    </button>
  </div>
</template>

<script>
export default {
  name: "SubmitButton",

  props: {
    msg: {
      type: String,
      required: true
    },
    isAdmin: {
      type: Boolean,
      default: false
    }
  }
}
</script>
```

## Первый тест

Добавим проверку сообщения в случае, когда у пользователя нет привилегий администратора.

```js
import { mount } from '@vue/test-utils'
import SubmitButton from '@/components/SubmitButton.vue'

describe('SubmitButton.vue', () => {
  it("Отображает сообщение для неавторизованного пользователя", () => {
    const msg = "Войти"
    const wrapper = mount(SubmitButton,{
      props: {
        msg: msg
      }
    })

    console.log(wrapper.html())

    expect(wrapper.find("span").text()).toBe("Не авторизован")
    expect(wrapper.find("button").text()).toBe("Войти")
  })
})
```

Запустим тесты через `yarn test:unit`. Результат будет следующий:

```bash
PASS  tests/unit/SubmitButton.spec.js
  SubmitButton.vue
    ✓ Отображает сообщение для неавторизованного пользователя (15ms)
```

Также выведется результат `console.log(wrapper.html())`

```html
<div>
  <span>Не авторизован</span>
  <button>
    Войти
  </button>
</div>
```

Как мы видим, `msg` обработался и разметка в результате отрисовалась правильно.

## Второй тест

Давайте также добавим проверку ещё одного возможного случая, когда `isAdmin` в значении `true`

```js
import { mount } from '@vue/test-utils'
import SubmitButton from '@/components/SubmitButton.vue'

describe('SubmitButton.vue', () => {
  it('Отображает сообщение для администратора', () => {
    const msg = "Войти"
    const isAdmin = true
    const wrapper = mount(SubmitButton,{
      props: {
        msg,
        isAdmin
      }
    })

    console.log(wrapper.html())
    
    expect(wrapper.find("span").text()).toBe("Admin Privileges")
    expect(wrapper.find("button").text()).toBe("submit")
  })
})
```

Запустим тесты через `yarn test:unit` и посмотрим на результаты:

```bash
PASS  tests/unit/SubmitButton.spec.js
  SubmitButton.vue
    ✓ Отображает сообщение для администратора (4ms)
```
Мы также вывели разметку через `console.log(wrapper.html())`:

```html
<div>
  <span>Привилегии администратора</span>
  <button>
    Войти
  </button>
</div>
```

Как мы видим `isAdmin` был использован, чтобы отрисовать правильный `<span>`

## Рефакторинг тестов

Давайте перепишем наши тесты, придерживаясь принципа "Don't Repeat Yourself" (не повторяйся). Так как все тесты проходят проверку, мы можем их уверенно изменять. После рефакторинга нам также нужно убедиться, что ничего не сломалось.

## Рефакторинг через фабрику (factory function)

В обоих тестах мы вызываем `shallowMount`, затем передаём похожий объект `props`. Мы можем это изменить, используя фабрику. Под фабрикой понимают функцию, которая возвращает объект – она производит объекты, отсюда и её название.

```js
const msg = "Войти"
const factory = (props) => {
  return mount(SubmitButton, {
    props: {
      msg,
      ...props
    }
  })
}
```

Выше приведена функция, которая отрисовывает компонент `SubmitButton` через `shallowMount`. Мы можем передавать любые данные первым аргументом в функцию `factory`. Давайте перепишем тесты, придерживаясь принципа DRY.

```js
describe("SubmitButton.vue", () => {
  describe("Нет привилегий администратора", ()=> {
    it("Выводит верное сообщение", () => {
      const wrapper = factory()

      expect(wrapper.find("span").text()).toBe("Не авторизован")
      expect(wrapper.find("button").text()).toBe("Войти")
    })
  })

  describe("Есть привилегии администратора", ()=> {
    it("Выводит верное сообщение", () => {
      const wrapper = factory({ isAdmin: true })

      expect(wrapper.find("span").text()).toBe("Привилегии администратора")
      expect(wrapper.find("button").text()).toBe("Войти")
    })
  })
})
```

Давайте запустим тесты ещё раз. Они всё ещё проходят проверку.

```bash
PASS  tests/unit/SubmitButton.spec.js
 SubmitButton
   Нет привилегий администратора
     ✓ Выводит верное сообщение (26ms)
   Есть привилегии администратора
     ✓ Выводит верное сообщение (3ms)
```

Поскольку у нас есть хороший набор тестов, мы можем легко и уверенно проводить рефакторинг.

## Заключение

- Передавая `props` во время отрисовки компонента, вы можете устанавливать входные параметры, которые будут применены в тесте
- Функции-фабрики могут быть использованы, чтобы достичь принципа DRY в тестах
- Вместо `props`, вы также можете использовать [`setProps`](https://vue-test-utils.vuejs.org/api/wrapper-array/#setprops-props) для передачи входных параметров в тесты.
