:::tip Ce livre est écrit pour Vue.js 3 et Vue Test Utils v2.
Vous trouverez la version Vue.js 2 [ici](/fr).
:::

## Deux façons de rendre un composant

`vue-test-utils` fournit deux façons de rendre, ou __mount__ un composant - `mount` et `shallowMount`. Un composant monté en utilisant l'une de ces méthodes retourne un `wrapper`, qui est un objet contenant le composant Vue, plus quelques méthodes utiles pour les tests.

Commençons par deux composants simples :

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

Commençons par rendre `Child` et appelons la méthode `html` fournie par `vue-test-utils` pour inspecter le balisage.

```js
const shallowWrapper = shallowMount(Child)
const mountWrapper = mount(Child)

console.log(shallowWrapper.html())
console.log(mountWrapper.html())
```

La sortie de `mountWrapper.html()` et de `shallowWrapper.html()` est la suivante :

```html
<div>Child component</div>
```

Aucune différence ici. Et avec `Parent` ?

```js
const shallowWrapper = shallowMount(Parent)
const mountWrapper = mount(Parent)

console.log(shallowWrapper.html())
console.log(mountWrapper.html())
```

`mountWrapper.html()` donne maintenant :

```html
<div><div>Child component</div></div>
```

Ce qui est le rendu complet des balises de `Parent` et `Child`. En revanche, `shallowWrapper.html()` produit ceci :

```html
<div><vuecomponent-stub></vuecomponent-stub></div>
```

L'endroit où devrait se trouver `<Child />` a été remplacé par `<vuecomponent-stub />`. `shallowMount` rend les éléments html normaux, mais remplace les composants Vue par un stub.

> Un stub est en quelque sorte un "faux" objet qui remplace un vrai.

Cela peut être utile. Imaginez que vous voulez tester votre composant `App.vue`, qui ressemble à ceci :

```vue
<template>
  <div>
    <h1>My Vue App</h1>
    <fetch-data />
  </div>
</template>
```

Et nous voulons tester que `<h1>My Vue App</h1>` est rendu correctement. Nous avons également un composant `<fetch-data>`, qui fait une demande à une API externe dans son crochet de cycle de vie `mounted`. 

Si nous utilisons `mount`, alors que tout ce que nous voulons faire est d'affirmer que du texte est rendu, `<fetch-data />` fera une requête API. Cela rendra notre test lent et susceptible d'échouer. Donc, nous supprimons les dépendances externes. En utilisant `shallowMount`, `<fetch-data />` sera remplacé par un `<vuecomponent-stub />`, et l'appel API ne sera pas lancé.

En règle générale, vous devriez essayer d'utiliser `mount`, car cela ressemblera davantage à vos composants et à la façon dont ils apparaîtront dans un environnement réel. Cela dit, si vous avez des difficultés à lancer de nombreuses requêtes API ou à fournir les dépendances nécessaires au rendu de votre composant, vous pouvez utiliser `shallowMount` :
