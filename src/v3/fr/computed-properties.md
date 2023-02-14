:::tip Ce livre est écrit pour Vue.js 3 et Vue Test Utils v2.
Vous trouverez la version Vue.js 2 [ici](/fr).
:::

## Test des propriétés calculées

Vous pouvez trouver le test décrit sur cette page [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app-vue-3/tests/unit/NumberRenderer.spec.js).

Tester les propriétés calculées est particulièrement simple, puisqu'il s'agit de simples fonctions JavaScript.

Commençons par examiner deux façons différentes de tester une propriété `computed`. Nous allons développer un composant `<NumberRenderer>`, qui rend les nombres pairs ou impairs, en fonction d'une propriété calculée `numbers`. 

## Écrire le test

Le composant `<NumberRenderer>` recevra une prop `even`, qui est un booléen. Si `even` est `true`, le composant devrait rendre 2, 4, 6, et 8. Si `false`, il devrait rendre 1, 3, 5, 7 et 9. La liste des valeurs sera calculée dans une propriété `computed` appelée `numbers`.

## Test en rendant la valeur

Le test :

```js
import { mount } from "@vue/test-utils"
import NumberRenderer from "@/components/NumberRenderer.vue"

describe("NumberRenderer", () => {
  it("renders even numbers", () => {
    const wrapper = mount(NumberRenderer, {
      props: {
        even: true
      }
    })

    expect(wrapper.text()).toBe("2, 4, 6, 8")
  })
})
```

Avant de lancer le test, configurons `<NumberRenderer>` :

```js
<template>
  <div>
  </div>
</template>

<script>
export default {
  name: "NumberRenderer",

  props: {
    even: {
      type: Boolean,
      required: true
    }
  }
}
</script>
```

Maintenant, nous commençons le développement, et laissons les messages d'erreur guider notre mise en œuvre. `yarn test:unit` donne des résultats :

```
● NumberRenderer › renders even numbers

  expect(received).toBe(expected) // Object.is equality

  Expected: "2, 4, 6, 8"
  Received: ""
```

On dirait que tout est bien branché. Commençons à implémenter `numbers` :

```js
computed: {
  numbers() {
    const evens = []

    for (let i = 1; i < 10; i++) {
      if (i % 2 === 0) {
        evens.push(i)
      }
    }

    return evens
  }
}
```

Et mettez à jour le modèle pour utiliser la nouvelle propriété calculée :

```html
<template>
  <div>
    {{ numbers }}
  </div>
</template>
```

`yarn test:unit` donne maintenant des résultats :

```
FAIL  tests/unit/NumberRenderer.spec.js
● NumberRenderer › renders even numbers

  expect(received).toBe(expected) // Object.is equality

  Expected: "2, 4, 6, 8"
  Received: "[
    2,
    4,
    6,
    8
  ]"
```

Les chiffres sont corrects, mais nous voulons rendre la liste joliment formatée. Mettons à jour la valeur `return` :

```js
return evens.join(", ")
```

Maintenant `yarn test:unit` passe ! 

## Test avec `call` 

Nous allons maintenant ajouter un test pour le cas de `even : false`. Cette fois, nous allons voir une autre façon de tester une propriété calculée, sans avoir à rendre le composant.

Le test, d'abord :

```js
it("renders odd numbers", () => {
  const localThis = { even: false }

  expect(NumberRenderer.computed.numbers.call(localThis)).toBe("1, 3, 5, 7, 9")
})
```

Au lieu de rendre le composant et de faire une assertion sur `wrapper.text()`, nous utilisons `call` pour fournir un contexte `this` alternatif à `numbers`. Nous verrons ce qui se passe si nous n'utilisons pas `call` après avoir fait passer le test.

L'exécution du test actuel donne les résultats suivants :

```
FAIL  tests/unit/NumberRenderer.spec.js
● NumberRenderer › renders odd numbers

  expect(received).toBe(expected) // Object.is equality

  Expected: "1, 3, 5, 7, 9"
  Received: "2, 4, 6, 8"
```

Mettre à jour `numbers` :


```js
numbers() {
  const evens = []
  const odds = []

  for (let i = 1; i < 10; i++) {
    if (i % 2 === 0) {
      evens.push(i)
    } else {
      odds.push(i)
    }
  }

  return this.even === true ? evens.join(", ") : odds.join(", ")
}
```

Maintenant les deux tests passent ! Mais que se serait-il passé si nous n'avions pas utilisé `call` dans le second test ? Essayez de le mettre à jour comme ceci :

```js
it("renders odd numbers", () => {
  const localThis = { even: false }

  expect(NumberRenderer.computed.numbers()).toBe("1, 3, 5, 7, 9")
})
```

Le test échoue maintenant :

```
FAIL  tests/unit/NumberRenderer.spec.js
● NumberRenderer › renders odd numbers

  expect(received).toBe(expected) // Object.is equality

  Expected: "1, 3, 5, 7, 9"
  Received: "2, 4, 6, 8"
```

`vue` lie automatiquement `props` à `this`. Cependant, nous ne rendons pas le composant avec `mount`, donc Vue ne lie rien à `this`. Si vous faites `console.log(this)`, vous pouvez voir que le contexte est simplement l'objet `computed` :

```
{ numbers: [Function: numbers] }
```

Nous devons donc utiliser `call`, qui nous permet de lier un autre objet `this`, dans notre cas, un objet avec une propriété `even`.

## `call` ou `mount` ?

Les deux techniques présentées sont utiles pour tester les propriétés calculées. Call peut être utile lorsque :

- Vous testez un composant qui effectue certaines opérations chronophages dans un cycle de vie des méthodes que vous souhaitez éviter d'exécuter dans votre test unitaire calculé.
- Vous voulez stub out certaines valeurs sur `this`. Utiliser `call` et passer un contexte personnalisé peut être utile. 

Bien sûr, vous voulez aussi vous assurer que la valeur est correctement rendue, alors assurez-vous de choisir la bonne technique lorsque vous testez vos propriétés calculées, et testez tous les cas limites.

## Conclusion

- Les propriétés calculées peuvent être utilisées en utilisant `mount` pour faire des assertions sur le balisage rendu.
- les propriétés calculées complexes peuvent être testées indépendamment en utilisant `call`.
