:::tip Ce livre est écrit pour Vue.js 2 et Vue Test Utils v1.
Vous trouverez la version Vue.js 3 [ici](/v3/fr).
:::

## Deux façons de rendre

`vue-test-utils` fournit deux façons de rendre ou de __monter__ un composant `mount`et `shallowMount`. Un composant monté en utilisant une de ces deux méthodes renvoie un `wrapper`, qui est un objet contenant le composant Vue, plus quelques méthodes pour les tests.

Commençons avec deux simples composants :

```js
const Child = Vue.component("Child", {
  name: "Child",

  template: "<div>Child component</div>"
})

const Parent = Vue.component("Parent", {
  name: "Parent",

  template: "<div><child /></div>"
})
```
Commençons par rendre le `Child` et appelant la méthode HTML que `vue-test-utils` nous fournit en inspectant le code.

```js
const shallowWrapper = shallowMount(Child)
const mountWrapper = mount(Child)

console.log(shallowWrapper.html())
console.log(mountWrapper.html())
```
Les deux fonctions `mountWrapper.html()` et `shallowWrapper.html()` donnent le résultat suivant:


```html
<div>Child component</div>
```
Pas de différence ici. Et pourquoi pas avec `Parent` ?

```js
const shallowWrapper = shallowMount(Parent)
const mountWrapper = mount(Parent)

console.log(shallowWrapper.html())
console.log(mountWrapper.html())
```

`mountWrapper.html()` donne maintenant le résultat :

```html
<div><div>Child component</div></div>
```
Ce qui complète le code `Parent` et `Child`. Par contre, `shallowWrapper.html()` produit ceci :

```html
<div><vuecomponent-stub></vuecomponent-stub></div>
```
L'endroit où `<Child>` doit être remplacé par `<vuecomponent-stub />`. `shallowMount` rend les éléments html normaux, mais remplace les composants Vue avec stub.

> Un stub est une sorte de "faux" objet qui se substitue à un vrai.

Cela peut être utile. Imaginez que vous vouliez tester votre composant `App.vue`, qui ressemble à ceci :

```vue
<template>
  <div>
    <h1>My Vue App</h1>
    <fetch-data />
  </div>
</template>
```

Et nous voulons tester que `<h1>My Vue App</h1>` soit correctement rendu. Nous avons aussi un composant `<fetch-data>` qui fait une requête à une API externe dans son crochet la vie `mounted`

Si nous utilisons `mount`, bien que tout ce que nous voulions faire soit d'affirmer qu'un certain texte est rendu, `<fetch-data />`, fera une requête API. Cela rendra notre test lent avec de possible échec. Donc nous éliminons les dépendances externes. En utilisant `shallowMount`, `<fetch-data />` sera remplacé par `<vuecomponent-stub />`, et l'appel API ne sera pas lancé.
