:::tip Ce livre est écrit pour Vue.js 2 et Vue Test Utils v1.
Vous trouverez la version Vue.js 3 [ici](/v3/fr).
:::

## Trouver des éléments


`vue-test-utils` fournit un certain nombre de possibilité pour trouver et affirmer la présence d'élément HTML ou d'autres composants Vue en utilisant la méthode `find`. L'utilisation principale de `find` est d'affirmer qu'un composant rend correctement un élément ou un composant enfant.


Le code source du test décrit sur cette page peut être trouvé [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/Parent.spec.js).

## Le création de composants

Pour cet exemple, nous allons créer un composant `<Child>` et un `<Parent>`.

Child:

```vue
<template>
  <div>Child</div>
</template>

<script>
export default {
  name: "Child"
}
</script>
```

Parent:

```vue
<template>
  <div>
    <span v-show="showSpan">
      Parent Component
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

## `find` avec la syntaxe `querySelector`

Les éléments réguliers peuvent facilement être sélectionner en utilisant la syntaxe utilisée avec `document.querySlector`. `vue-test-utils` fournit la méthode `isVisible` qui vérifie si les éléments rendus conditionnellement avec `v-show` sont visibles. Créer un fichier `Parent.spec.js` et à l'intérieur ajouter le test suivant :

```js
import { mount } from "@vue/test-utils"
import Parent from "@/components/Parent.vue"

describe("Parent", () => {
  it("does not render a span", () => {
    const wrapper = mount(Parent)

    expect(wrapper.find("span").isVisible()).toBe(false)
  })
})
```
Puisque `v-show="showSpan"` est par défaut `false`, nous espérons trouver `false` à la méthode `isVisible` de l'élément `<span>`. Les tests passent quand nous exécutons `yarn test:unit`. Ensuite, un test avec le cas `showSpan` est `true`.  

```js
it("does render a span", () => {
  const wrapper = mount(Parent, {
    data() {
      return { showSpan: true }
    }
  })

  expect(wrapper.find("span").isVisible()).toBe(true)
})
```
Ça passe ! Tout comme `isVisible` pour `v-show`, `vue-test-utils` fournit une méthode à utiliser quand nous devons tester le rendu conditionnel de l'élément en utilisant `v-if`.


## Trouver des composants avec `name` et `Component`

Trouver des composants enfants est légèrement différent qu'avec des éléments HTML. Il y a deux façons principales d'affirmer la présence des composants enfants :

1. `find(Component)`
2. `find({ name: "ComponentName" })`

C'est un peu plus facile à comprendre dans le contexet d'un exemple. Commençons avec la syntaxe `find(Component)`. Cela nous oblige d'importer le composant et à le passer par la fonction `find`.


```js
import Child from "@/components/Child.vue"

it("does not render a Child component", () => {
  const wrapper = mount(Parent)

  expect(wrapper.find(Child).exists()).toBe(false)
})
```
L'implémentation pour `find` est un peu plus complexe, depuis qu'il fonctionne avec la syntaxe `querySelector`, aussi bien qu'avec d'autres syntaxes. Vous pouvez voir la partie du code source du composant enfant [ici](https://github.com/vuejs/vue-test-utils/blob/dev/packages/test-utils/src/find.js). Il vérifie simplement que le nom `name` du composant sur chaque enfant retourné, puis vérifie le `constuctor` et quelques autres propriétés.



Comme mentionné dans le paragraphe précédent, la propriété `name` et l'une des vérifications faites avec `find` quand vous passez un composant. Au lieu de passer le composant, vous pouvez simplement passer un objet avec la propriété `name` correcte. Cela signifie que vous n'avez pas d'importer le composant. Testons le cas où `<Child>`devrait être rendu :


```js
it("renders a Child component", () => {
  const wrapper = mount(Parent, {
    data() {
      return { showChild: true }
    }
  })

  expect(wrapper.find({ name: "Child" }).exists()).toBe(true)
})
```
Ça passe ! Utiliser la propriété `name` peut être un peu contre intuitive, donc importer le composant réel est une alternative. Une autre option est simplement d'ajouter une `class` ou un `id` et d'utiliser une requête en utilisant la syntaxe `querySelector` présentée dans les deux premiers exemples.

## `findAll`

Il y a souvent des cas où l'on veut affirmer qu'un certain d'éléments sont rendus. Un cas courant est une liste d'éléments rendu avec `v-for`. Voici un composant `<ParentWithManyChildren`qui rend plusieurs éléments `<Child>`.


```js
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
Nous pouvons écrire un test en utilisant `findAll` pour affirmer que trois composants `<Child>` sont rendus comme ceci :

```js
it("renders many children", () => {
  const wrapper = mount(ParentWithManyChildren)

  expect(wrapper.findAll(Child).length).toBe(3)
})
```

L'utilisation  de `yarn test:unit` montre que le test est réussi. Vous pouvez également utiliser la syntaxe `querySelector` avec `findAll`

## Conclusion

Cette page couvre :

- L'utilisation de `find`et de `findAll` avec la syntaxe de `querySlector`
- `isVisible` et `exists`
- L'utilisation de `find` et de `findAll` avec un composant ou un `name` comme sélecteur.

Le code source du test décrit sur cette page peut être trouvé [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/Parent.spec.js).
