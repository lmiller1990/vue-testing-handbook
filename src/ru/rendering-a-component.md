:::tip Это руководство было написано для Vue.js 2 и Vue Test Utils v1.
Версия для Vue.js 3 [здесь](/v3/ru).
:::

## Два способа отрисовки

`vue-test-utils` позволяет отрисовывать компонент двумя способами – `mount` и `shallowMount`. В любом из этих случаев, метод вернёт так называемый `wrapper`, который содержит объект с Vue компонентом и некоторыми полезными методами для тестирования.

Давайте разберёмся на двух простых компонентах:

```js
const Child = Vue.component("Child", {
  name: "Child",

  template: "<div>Дочерний компонент</div>"
})

const Parent = Vue.component("Parent", {
  name: "Parent",

  template: "<div><child/></div>"
})
```

Начнём с отрисовки `Child`, а затем вызовем метод `html`, который предоставляет `vue-test-utils` для тестирования разметки. 

```js
const shallowWrapper = shallowMount(Child)
const mountWrapper = mount(Child)

console.log(shallowWrapper.html())
console.log(mountWrapper.html())
```


Оба `mountWrapper.html()` и `shallowWrapper.html()` дают одинаковый результат:

```html
<div>Дочерний компонент</div>
```

Разницы нет. Но что насчёт `Parent`?

```js
const shallowWrapper = shallowMount(Parent)
const mountWrapper = mount(Parent)

console.log(shallowWrapper.html())
console.log(mountWrapper.html())
```

`mountWrapper.html()` теперь выводит:

```html
<div><div>Дочерний компонент</div></div>
```

Полностью повторяется разметка `Parent` и `Child`. Однако `shallowWrapper.html()` выводит следующее:

```html
<div><vuecomponent-stub></vuecomponent-stub></div>
```

То место, где должен быть `<Child />` теперь занимает `<vuecomponent-stub />`. `shallowMount` отрисовывает обычный html, но заменяет Vue-компоненты на заглушки.

> Под заглушкой (stub) понимают поддельный объект, который помещается вместо настоящего.

Это может быть полезно. Представьте, вы хотите протестировать компонент `App.vue`, который выглядит так:

```vue
<template>
  <div>
    <h1>Моё Vue-приложение</h1>
    <fetch-data />
  </div>
</template>
```

И мы хотим протестировать, что `<h1>Моё Vue-приложение</h1>` выводится правильно. У нас также есть компонент `<fetch-data/>`, который делаем запросы к стороннему API в своём `mounted`  хуке.

Если мы используем `mount`, то `<fetch-data/>` сделает запрос к API, хотя мы хотим всего лишь проверить отрисовку текста. Это сделаем наши тесты медленными и ненадёжными. Поэтому мы применяем заглушки для сторонних зависимостей. Используя `shallowMount`, компонент `<fetch-data/>` заменится на `<vuecomponent-stub />` и запроса к API не произойдёт.

Как правило, вы должны использовать `mount`, поскольку это будет отражать поведение компонента в реальной среде. Тем не менее, если у вас возникли проблемы с выполнением множественных запросов API или с предоставлением необходимых зависимостей для рендеринга вашего компонента – вы можете использовать `shallowMount`.
