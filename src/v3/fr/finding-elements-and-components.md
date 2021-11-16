:::tip  Ce livre est écrit pour Vue.js 3 et Vue Test Utils v2.
Vous trouverez la version Vue.js 2 [ici](/fr).
:::

## Trouver des éléments

`vue-test-utils` fournit un certain nombre de moyens pour trouver et affirmer la présence d'éléments html ou d'autres composants Vue en utilisant les méthodes `find` et `findComponent`. L'utilisation principale de `find` est d'affirmer qu'un composant rend correctement un élément ou un composant enfant.

> Note : Si vous avez utilisé Vue Test Utils avant la v1, vous vous souvenez peut-être que `find` fonctionnait avec les composants ainsi que les éléments DOM. Maintenant vous utilisez `find` et `findAll` pour les éléments DOM, et `findComponent` et `findAllComponents` pour les composants Vue. Il existe également une paire `get` et `getComponent`, qui sont exactement les mêmes que `find` et `findComponent`, mais qui lèvent une erreur si elles ne trouvent rien. Ce guide choisit d'utiliser `find` et `findComponent`.

Le code source du test décrit sur cette page se trouve [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app-vue-3/tests/unit/Parent.spec.js).

## Création des composants

Pour cet exemple, nous allons créer un composant `<Child>` et `<Parent>`.

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

Les éléments réguliers peuvent facilement être sélectionnés en utilisant la syntaxe utilisée avec `document.querySelector`. `vue-test-utils` fournit également une méthode `isVisible` pour vérifier si les éléments rendus conditionnellement avec `v-show` sont visibles. Créez un fichier `Parent.spec.js`, et à l'intérieur ajoutez le test suivant :

```js
import { mount } from "@vue/test-utils"
import '@testing-library/jest-dom'
import Parent from "@/components/Parent.vue"

describe("Parent", () => {
  it("does not render a span", () => {
    const wrapper = mount(Parent)

    expect(wrapper.find("span").element).not.toBeVisible()
  })
})
```

Puisque `v-show="showSpan"`a la valeur par défaut `false`, nous nous attendons à ce que l'élément `<span>` trouvé ne soit pas visible. Nous utilisons les impressionnants matchers de `@testing-library/jest-dom` pour valider cela - déterminer la visibilité est une affaire délicate, donc Vue Test Utils laisse cela à une autre bibliothèque testée par la bataille. Les tests passent quand ils sont exécutés avec `yarn test:unit`. Ensuite, un test autour du cas où `showSpan` est `true`.

```js
it("does render a span", () => {
  const wrapper = mount(Parent, {
    data() {
      return { showSpan: true }
    }
  })

  expect(wrapper.find("span").element).toBeVisible()
})
```

Il passe !

## Trouver des composants avec `name` et `Component`.

Trouver des composants enfants est un peu différent de trouver des éléments HTML ordinaires. Il y a deux façons principales d'affirmer la présence de composants Vue enfants :

1. `findComponent(Component)`
2. `findComponent({ name: "ComponentName" })`

Elles sont un peu plus faciles à comprendre dans le contexte d'un exemple de test. Commençons par la syntaxe `findComponent(Component)`. Pour cela, nous devons `import` le composant, et le passer à la fonction `findComponent`.

```js
import Child from "@/components/Child.vue"

it("does not render a Child component", () => {
  const wrapper = mount(Parent)

  expect(wrapper.findComponent(Child).exists()).toBe(false)
})
```

L'implémentation de `find` et `findComponent` est assez complexe, puisqu'elle fonctionne avec le `querySelector` pour les éléments DOM, ainsi que plusieurs autres syntaxes pour les composants Vue. Vous pouvez voir la partie du source qui trouve les composants Vue enfants [ici](https://github.com/vuejs/vue-test-utils/blob/dev/packages/test-utils/src/find.js). Il vérifie essentiellement le `name` du composant par rapport à chaque enfant rendu, et ensuite vérifie le `constructor`, et quelques autres propriétés. 

Comme mentionné dans le paragraphe précédent, la propriété `name` est l'une des vérifications effectuées par `find` lorsque vous passez un composant. Au lieu de passer le composant, vous pouvez simplement passer un objet avec la bonne propriété `name`. Cela signifie que vous n'avez pas besoin d`import` le composant. Testons le cas où `<Child>` doit être rendu :

```js
it("renders a Child component", () => {
  const wrapper = mount(Parent, {
    data() {
      return { showChild: true }
    }
  })

  expect(wrapper.findComponent({ name: "Child" }).exists()).toBe(true)
})
```

Il passe ! L'utilisation de la propriété `name` peut être peu intuitive, donc importer le composant réel est une alternative. Une autre option est de simplement ajouter une `class` ou un `id` et de faire une requête en utilisant la syntaxe de style `querySelector` présentée dans les deux premiers exemples.

## `findAll` et `findAllComponents`

Il y a souvent des cas où vous voulez affirmer qu'un certain nombre d'éléments sont rendus. Un cas courant est une liste d'éléments rendus avec `v-for`. Voici un `<ParentWithManyChildren>` qui rend plusieurs composants `<Child>`.

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

Nous pouvons écrire un test utilisant `findAllComponents` pour vérifier que trois composants `<Child>` sont rendus comme ceci :

```js
it("renders many children", () => {
  const wrapper = mount(ParentWithManyChildren)

  expect(wrapper.findAllComponents(Child).length).toBe(3)
})
```

L'exécution de `yarn test:unit` montre que le test passe. Vous pouvez également utiliser la syntaxe `querySelector` avec `findAll`.

## Conclusion

Cette page couvre :

- utiliser `find` et `findAll` avec la syntaxe `querySelector` pour les éléments du DOM
- utiliser `findComponent` et `findAllComponents` pour les composants Vue
- utilisez `exists` pour vérifier si quelque chose est présent, `toBeVisible` de `@testing-library/jest-dom` pour voir si quelque chose est présent mais non visible 

Le code source du test décrit sur cette page se trouve [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app-vue-3/tests/unit/Parent.spec.js).

