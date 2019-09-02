## Поиск элементов

`vue-test-utils` даёт возможность находить и проверять html-элементы или другие Vue-компоненты разными способами, используя метод `find`. Основной задачей `find` является проверка, что компонент правильно отрисовывает элемент или дочерений компонент.

Исходный код для теста на этой странице можно найти [здесь](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/Parent.spec.js).

## Создание компонентов

Для этого примера, мы создадим компоненты `<Child>` и `<Parent>`.

`Child`: 

```vue
<template>
  <div>Дочерний компонент</div>
</template>

<script>
export default {
  name: "Child"
}
</script>
```

`Parent`:

```vue
<template>
  <div>
    <span v-show="showSpan">
      Родительский компонент
    </span>
    <Child v-if="showChild" />
  </div>
</template>

<script>
import Child from "./Child.vue"

export default {
  name: "Parent",

  components: { Child },

  data() {
    return {
      showSpan: false,
      showChild: false
    }
  }
}
</script>
```

## Синтаксис `find` и `querySelector`

Обычные элементы можно легко выбрать, используя синтаксис похожий на `document.querySelector`. `vue-test-utils` также предоставляет метод `isVisible`, чтобы проверять отрисовался ли элемент по условию с `v-show`. Создадим `Parent.spec.js` и внутрь добавим следующий тест:


```js
import { mount, shallowMount } from "@vue/test-utils"
import Parent from "@/components/Parent.vue"

describe("Parent", () => {
  it("Не отрисовывает span", () => {
    const wrapper = shallowMount(Parent)

    expect(wrapper.find("span").isVisible()).toBe(false)
  })
})
```

Так как `v-show="showSpan"` по умолчанию в значении `false`, мы предполагаем, что метод `isVisible` не найдёт `<span>` элемент и вернёт `false`. При запуске `yarn test:unit`, тесты проходят проверку. Теперь нужно протестировать случай, когда `showSpan` в значении `true`.
    

```js
it("Отрисовывает span", () => {
  const wrapper = shallowMount(Parent, {
    data() {
      return { showSpan: true }
    }
  })

  expect(wrapper.find("span").isVisible()).toBe(true)
})
```
 Это работает! `vue-test-utils` также предоставляет метод `exists`, похожий на `isVisible`. В нём проверяется условная отрисовка через `v-if`.

## Поиск компонентов через `name` и `Component`

Поиск дочерних компонентов немного отличается от поиска обычных HTML элементов. Есть два основных способа проверить наличие дочерних компонентов:

1. `find(Component)`
2. `find({ name: "ComponentName" })`

Это будет проще понять на примере. Давайте разберём синтаксис `find(Component)`. Нам нужно импортировать компонент через `import` и передать его в функцию `find`.

```js
import Child from "@/components/Child.vue"

it("не отрисовывает компонент Child", () => {
  const wrapper = shallowMount(Parent)

  expect(wrapper.find(Child).exists()).toBe(false)
})
```

Реализация метода `find` довольно сложная, так как он работает с синтаксисом `querySelector` и некоторыми другими. [Здесь](https://github.com/vuejs/vue-test-utils/blob/dev/packages/test-utils/src/find.js) вы можете посмотреть на часть исходного кода, в котором ищутся дочерние компоненты. В основном, там проверяется `name` всех отрисованных компонентов, а затем проверяется `constructor` и некоторые другие свойства. 

Как говорилось в предыдущем абзаце, когда вы передаете компонент в `find`, выполняется проверка свойства `name`.
Вместо того чтобы передавать компонент, вы можете просто передать объект с правильным свойством `name`. Это значит, что вам не нужно использовать `import` для компонента. Давайте протестируем случай, когда `<Child>` должен отрисовываться:

```js
it("отрисовывает компонент Child", () => {
  const wrapper = shallowMount(Parent, {
    data() {
      return { showChild: true }
    }
  })

  expect(wrapper.find({ name: "Child" }).exists()).toBe(true)
})
```

Это работает! Использовать свойство `name` может быть немного не интуитивно, поэтому можно испортировать компонент как альтенатива. Также можно просто добавить `class` или `id`, а затем найти элемент синтаксисом `querySelector` как в первых двух примерах.

## `findAll`

Часто бывают случаи, когда вы хотит проверить количество отрисованных элементов. Обычно список элементов отрисовывается через `v-for`. Вот компонент `<ParentWithManyChildren>`, который отрисовывает несколько компонентов `<Child>`.

```vue
<template>
  <div>
    <Child v-for="id in [1, 2 ,3]" :key="id" />
  </div>
</template>

<script>
import Child from "./Child.vue"

export default {
  name: "ParentWithManyChildren",

  components: { Child }
}
</script>
```

Вот так мы можем написать тест, используя `findAll` для проверки отрисовки трёх компонентов `<Child>`.

```js
it("отрисовывает несколько дочерних компонентов", () => {
  const wrapper = shallowMount(ParentWithManyChildren)

  expect(wrapper.findAll(Child).length).toBe(3)
})
```

Запуск `yarn test:unit` показывает, что тест проходят проверку. Вы также можете использовать `querySelector` с синтаксисом `findAll`.

## Заключение

На этой странице рассматривалось, как:

- использовать `find` и `findAll` с синтаксисом `querySelector
- `isVisible` и `exists`
- использовать `find` и `findAll` с компонентом или именем как селектором

Исходный код для теста на этой странице можно найти [здесь](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/Parent.spec.js).

