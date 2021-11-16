:::tip Ce livre est écrit pour Vue.js 2 et Vue Test Utils v1.
Vous trouverez la version Vue.js 3 [ici](/v3/fr).
:::

## Tester la propriété Computed

Vous pouvez trouver le test décrit sur cette page [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/NumberRenderer.spec.js).

Le test des propriétés computed sont particulièrement simple, puisqu'il s'agit de bon vieux JavasScript.

Commençons par examiner deux façons de tester la propriété `computed`. Nous allons développer un composant `<NumberRendere>`, qui rend les nombres pairs ou impairs, basé sur une propriété computed `numbers`


## Ecrire le test

Le composant `<NumberRender>` va recevoir un prop `even` qui est un booléen. Si `even` est `true`, le composant devrait renvoyer 2, 4, 6 et 8. S'il est `false`, il devrait renvoyer 1, 3, 5, 7 et 9. la liste des valeurs va être calculer dans la propriété `computed` appeler `numbers`.

## Tester en renvoyant la valeur

Le test :

```js
import { mount } from "@vue/test-utils"
import NumberRenderer from "@/components/NumberRenderer.vue"

describe("NumberRenderer", () => {
  it("renders even numbers", () => {
    const wrapper = mount(NumberRenderer, {
      propsData: {
        even: true
      }
    })

    expect(wrapper.text()).toBe("2, 4, 6, 8")
  })
})
```
Avant de lancer le test, configurons `<NumberRenderer>`:

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
Maintenant commençons le développement, et laissons les messages d'erreur guider notre implémentation. `yarn test:unit`:

```
● NumberRenderer › renders even numbers

  expect(received).toBe(expected) // Object.is equality

  Expected: "2, 4, 6, 8"
  Received: ""
```
Il semble que tout soit bien an place. Commençons à implémenter `numbers`:

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
Et de mettre à jour notre modèle pour utiliser notre nouvelle propriété computed :
```html
<template>
  <div>
    {{ numbers }}
  </div>
</template>
```

Maintenant `yarn test:unit` nous renvoie :

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
Les nombres sont correct, mais nous voulons que la liste soit bien formatée. Mettons à jour la valeur de `retour` :

```js
return evens.join(", ")
```

Maintenant `yarn test:unit` passe!

## Tester avec `call`

Nous allons maintenant ajouter le test pour le cas ou `even: false`. Cette fois, nous allons voir une autre façon de tester la propriété computed, sans renvoyer réellement un composant.

Le test, d'abord:

```js
it("renders odd numbers", () => {
  const localThis = { even: false }

  expect(NumberRenderer.computed.numbers.call(localThis)).toBe("1, 3, 5, 7, 9")
})
```
Au lieu de renvoyer le composant et de faire une affirmation sur `wrapper.text()`, nous allons utiliser `call` pour fournir un contexte alternatif à `this`. Nous allons voir ce qui se passe si nous n'utilisons pas `call` après avoir réussi le test.

L’exécution du test nous donner des résultats :

```
FAIL  tests/unit/NumberRenderer.spec.js
● NumberRenderer › renders odd numbers

  expect(received).toBe(expected) // Object.is equality

  Expected: "1, 3, 5, 7, 9"
  Received: "2, 4, 6, 8"
```

La mise à jour de`numbers` :


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
Maintenant nos deux tests passent ! Mais que ce serait-il passé si nous n'avions pas utilisé `call` dans le deuxième test ? Essayez de le mettre à jour comme ceci :

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

`vue` lie automatiquement `props` à `this`. Nous ne renvoyons pas le composant avec `mount`, donc Vue le lie rien à `this`. Si vous faite un `console.log(this)`, vous pouvez voir que le contexte est simplement l’objet `computed` :

```
{ numbers: [Function: numbers] }
```
Donc nous avons besoin d'utiliser `call`, qui nous permet de lier l'objet `this`, dans notre cas avec la propriété `even`.

## Pour `call` ou pour `mount`?
Ces deux techniques présentées sont utiles pour tester les propriétés computed. `call` peut être utile quand :

- Vous testez un composant qui effectue des opérations qui prennent du temps dans un cycle de vie et que vous aimeriez éviter de l'exécuter dans votre test unitaire computed.
- Vous voulez mettre en avant certaines valeurs sur `this`. En utilisant `call` et passer un contexte personnalisé peut être utile.

Bien sûr, vous voulez être sûr que la valeur est correctement renvoyé, alors assurez-vous de choisir la bonne technique quand vous testerez vos propriétés computed et de tester tous les cas.


## Conclusion

- Les propriétés computed peuvent être utilisées en utilisant `mount` en faisant des affirmations sur le rendu du code.
- Les propriétés complexes de computed peuvent être testées indépendamment en utilisant `call`.
