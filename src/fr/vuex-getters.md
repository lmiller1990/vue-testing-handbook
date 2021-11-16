:::tip Ce livre est écrit pour Vue.js 2 et Vue Test Utils v1.
Vous trouverez la version Vue.js 3 [ici](/v3/fr).
:::

## Tester les accesseurs (getters)

Il est facile de tester les accesseurs de manière isolées, puisqu'il s'agit essentiellement de simples fonctions JavaScript. Les techniques sont assez similaires aux tests des mutations, plus d'informations [ici](https://lmiller1990.github.io/vue-testing-handbook/vuex-mutations.html), et aux actions.

Le code source du test décrit sur cette page peut être trouvé [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/getters.spec.js).

Nous allons voir deux accesseurs, qui fonctionne sur un store qui ressemble à celui-ci :

```js
const state = {
  dogs: [
    { name: "lucky", breed: "poodle", age: 1 },
    { name: "pochy", breed: "dalmatian", age: 2 },
    { name: "blackie", breed: "poodle", age: 4 }
  ]
}
```
Les accesseurs nous allons tester sont :


1. `poodles`: reçoit tous les `poodles`.
2. `poodlesByAge`: il obtient tous les `poodles`, et accepte un argument d'âge.

## Créer les accesseurs

Premièrement, créons les accesseurs.

```js
export default {
  poodles: (state) => {
    return state.dogs.filter(dog => dog.breed === "poodle")
  },

  poodlesByAge: (state, getters) => (age) => {
    return getters.poodles.filter(dog => dog.age === age)
  }
}
```
Rien de bien excitant, rappelez-vous que les accesseurs peuvent recevoir d'autre accesseurs comme second argument. Bien que nous ayons déjà un accesseur `poodles`, nous l'utiliser dans `poodlesByAges`. En retour de la fonction dans `poddlesByAge` qui prend un argument, nous pouvons passer des arguments aux accesseurs. L'accesseur `poodlesByAge` peût être utilisé comme ceci :

```js
computed: {
  puppies() {
    return this.$store.getters.poodlesByAge(1)
  }
}
```
Commençons par un test pour `poodles`.

## Ecrire les tests

Comme un accesseur est juste une fonction JavaScript qui prend en premier argument un `state`, le test est vraiment simple. Je vais écrire mon test dans le fichier `getters.spec.js`, le code suivant :

```js
import getters from "../../src/store/getters.js"

const dogs = [
  { name: "lucky", breed: "poodle", age: 1 },
  { name: "pochy", breed: "dalmatian", age: 2 },
  { name: "blackie", breed: "poodle", age: 4 }
]
const state = { dogs }

describe("poodles", () => {
  it("returns poodles", () => {
    const actual = getters.poodles(state)

    expect(actual).toEqual([ dogs[0], dogs[2] ])
  })
})
```
Vuex passe automatiquement le `state` à l'accesseur. Comme nous testons les accesseurs de manière isolée, nous devons passer manuellement le `state`. D'un autre côté, nous allons juste tester une fonction JavaScript normale.

Le test `poodlesByAge` est un peu plus intéressant. Le second argument de l'accesseur est un autre accesseur. Nous testons `poodlesByAge`, donc nous ne voulons pas impliquer l'implémentation de `poodles`. A la place nous pouvons mettre des `getters.poodles`. Cela nous permettra d'avoir un contrôle plus fin sur le test.

```js
describe("poodlesByAge", () => {
  it("returns poodles by age", () => {
    const poodles = [ dogs[0], dogs[2] ]
    const actual = getters.poodlesByAge(state, { poodles })(1)

    expect(actual).toEqual([ dogs[0] ])
  })
})
```
Au lieu de passer le vrai accesseur `poodles`, nous passons le résultat qu'il rendrait. Nous savons déjà qu'il fonctionne, puisque nous avons déjà fait un test pour lui. Cela nous permet de nous concentrer uniquement sur la logique du test de `poodlesByAge`.

Il est possible d'avoir des accesseurs `async`. Ils peuvent être testé en utilisant la même technique que les actions `async`, vous pouvez en savoir plus [ici](https://lmiller1990.github.io/vue-testing-handbook/vuex-actions.html).

## Conclusion

- Les accesseurs ne sont que de simples fonctions JavaScript.
- Quand vous testez les accesseurs de façon isolés, vous devez passer le state manuellement.
- Si un accesseur utilise un autre accesseur, vous devez saisir le résultat attendu du premier accesseur. Cela vous donnera un plus grand contrôle et vous permettra de vous concentrer sur le test de l'accesseur en question.

Le code source du test décrit sur cette page peut être trouvé [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/getters.spec.js).
