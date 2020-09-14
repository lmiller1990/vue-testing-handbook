:::tip Это руководство было написано для Vue.js 3 и Vue Test Utils v2.
Версия для Vue.js 2 [здесь](/ru).
:::

## Поиск элементов

`vue-test-utils` даёт возможность находить и проверять html элементы или другие Vue компоненты разными способами, используя метод `find` и `findComponent`. Основной задачей `find` является проверка, что компонент правильно отрисовывает элемент или дочерний компонент.

> Заметка: Если вы использовали Vue Test Utils до v1, вы, возможно, помните, что `find` одновременно работал и с компонентами и с DOM элементами. Теперь вы должны использовать `find` и `findAll` для DOM элементов, а `findComponent` и `findAllComponents` для Vue компонентов. Есть также метод `get` в паре с `getComponent`, которые работают идентично `find` и `findComponent`, но они выбрасывают ошибку, если ничего не найдут. В этом руководстве используются методы `find` и `findComponent`.

Исходный код для теста на этой странице можно найти [здесь](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app-vue-3/tests/unit/Parent.spec.js).

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

Обычные элементы можно легко найти, используя синтаксис похожий на `document.querySelector`. `vue-test-utils` также предоставляет метод `isVisible`, чтобы проверять отрисовался ли элемент по условию с `v-show`. Создадим `Parent.spec.js` и внутрь добавим следующий тест:

```js
import { mount, shallowMount } from "@vue/test-utils"
import '@testing-library/jest-dom'
import Parent from "@/components/Parent.vue"

describe("Parent.vue", () => {
  it("Не отрисовывает span", () => {
    const wrapper = shallowMount(Parent)

    expect(wrapper.find("span").element).not.toBeVisible()
  })
})
```

Так как `v-show="showSpan"` по умолчанию в значении `false`, мы предполагаем, что найденный `<span>` элемент не виден. Мы используем потрясающие матчеры из `@testing-library/jest-dom` для проверки этого поведения. Определение видимости элемента – дело не простое, поэтому Vue Test Utils оставляет его для другой библиотеки. При запуске `yarn test:unit`, тесты проходят проверку. Теперь нужно протестировать случай, когда `showSpan` в значении `true`.

```js
it("Отрисовывает span", () => {
  const wrapper = shallowMount(Parent, {
    data() {
      return { showSpan: true }
    }
  })

  expect(wrapper.find("span").element).toBeVisible()
})
```

 Это работает!

## Поиск компонентов через `name` и `Component`

Поиск дочерних компонентов немного отличается от поиска обычных HTML элементов. Есть два основных способа проверить наличие дочерних компонентов:

1. `findComponent(Component)`
2. `findComponent({ name: "ComponentName" })`

Это будет проще понять на примере. Давайте разберём синтаксис `findComponent(Component)`. Нам нужно импортировать компонент через `import` и передать его в функцию `findComponent`.

```js
import Child from "@/components/Child.vue"

it("не отрисовывает компонент Child", () => {
  const wrapper = shallowMount(Parent)

  expect(wrapper.findComponent(Child).exists()).toBe(false)
})
```

Реализация метода `find` и `findComponent` довольно сложная, так как он работает с синтаксисом `querySelector` и некоторыми другими. [Здесь](https://github.com/vuejs/vue-test-utils/blob/dev/packages/test-utils/src/find.js) вы можете посмотреть на часть исходного кода, в котором ищутся дочерние компоненты. В основном, там проверяется `name` всех отрисованных компонентов, а затем проверяется `constructor` и некоторые другие свойства. 

Как говорилось в предыдущем абзаце, когда вы передаёте компонент в `find`, выполняется проверка свойства `name`.
Вместо того чтобы передавать компонент, вы можете просто передать объект с правильным свойством `name`. Это значит, что вам не нужно использовать `import` для компонента. Давайте протестируем случай, когда `<Child>` должен отрисовываться:

```js
it("отрисовывает компонент Child", () => {
  const wrapper = shallowMount(Parent, {
    data() {
      return { showChild: true }
    }
  })

  expect(wrapper.findComponent({ name: "Child" }).exists()).toBe(true)
})
```

Это работает! Использовать свойство `name`, может быть, немного не интуитивно, поэтому, как альтернативу, можно импортировать компонент. Также можно просто добавить `class` или `id`, а затем найти элемент синтаксисом `querySelector`, как в первых двух примерах.

## `findAll` и `findAllComponents`

Часто бывают случаи, когда вы хотите проверить количество отрисованных элементов. Обычно, список элементов отрисовывается через `v-for`. Вот, компонент `<ParentWithManyChildren>`, который отрисовывает несколько компонентов `<Child>`.

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

Вот так мы можем написать тест, используя `findAllComponents` для проверки отрисовки трёх компонентов `<Child>`:

```js
it("отрисовывает несколько дочерних компонентов", () => {
  const wrapper = shallowMount(ParentWithManyChildren)

  expect(wrapper.findAllComponents(Child).length).toBe(3)
})
```

Запуск `yarn test:unit` показывает, что тест проходит проверку. Вы также можете использовать `querySelector` с синтаксисом `findAll`.

## Заключение

На этой странице рассматривалось, как:

- использовать `find` и `findAll` с синтаксисом похожим на `querySelector`
- использовать `findComponent` и `findAllComponents` для поиска Vue компонентов
- использовать `exists` для проверки существования чего-либо, `toBeVisible` из `@testing-library/jest-dom` для проверки элементов, которые существуют, но не видимы

Исходный код для теста на этой странице можно найти [здесь](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app-vue-3/tests/unit/Parent.spec.js).

