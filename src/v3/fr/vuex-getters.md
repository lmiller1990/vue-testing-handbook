:::tip Ce livre est écrit pour Vue.js 3 et Vue Test Utils v2.
Vous trouverez la version Vue.js 2 [ici](/fr).
:::

## Tester les getters

Tester les getters de manière isolée est simple, puisqu'il ne s'agit en fait que de fonctions JavaScript. Les techniques sont similaires à celles utilisées pour tester les mutations, plus d'informations [ici](https://lmiller1990.github.io/vue-testing-handbook/vuex-mutations.html), et les actions. 

Le code source du test décrit sur cette page se trouve [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app-vue-3/tests/unit/getters.spec.js).

Nous allons examiner deux getters, qui opèrent sur un magasin qui ressemble à ceci :

```js
const state = {
  dogs: [
    { name: "lucky", breed: "poodle", age: 1 },
    { name: "pochy", breed: "dalmatian", age: 2 },
    { name: "blackie", breed: "poodle", age: 4 }
  ]
}
```

Les getters que nous allons tester sont :

1. `poodles` : obtient tous les `poodles`.
2. `poodlesByAge` : récupère tous les caniches, et accepte un argument d'âge.

## Créer les récupérateurs

Tout d'abord, créons les getters. 

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

Rien de bien excitant - rappelez-vous que les getters reçoivent d'autres getters comme deuxième argument. Puisque nous avons déjà un getter `poodles`, nous pouvons l'utiliser dans `poodlesByAge`. En retournant une fonction dans `poodlesByAge` qui prend un argument, nous pouvons passer des arguments aux getters. Le getter `poodlesByAge` peut être utilisé comme ceci :

```js
computed: {
  puppies() {
    return this.$store.getters.poodlesByAge(1)
  }
}
```

Commençons par un test pour `poodles`.

## Écrire les tests

Puisqu'un getter est juste une fonction JavaScript qui prend un objet `state` comme premier argument, le test est très simple. Je vais écrire mon test dans un fichier `getters.spec.js`, avec le code suivant :

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

Vuex passe automatiquement le `state` au getter. Comme nous testons les getters de manière isolée, nous devons passer manuellement le `state`. En dehors de cela, nous testons juste une fonction JavaScript normale.

`poodlesByAge` est un peu plus intéressant. Le second argument d'un getter est un autre `getters`. Nous testons `poodlesByAge`, donc nous ne voulons pas impliquer l'implémentation de `poodles`. A la place, nous pouvons utiliser `getters.poodles`. Cela nous donnera un contrôle plus fin sur le test.

```js
describe("poodlesByAge", () => {
  it("returns poodles by age", () => {
    const poodles = [ dogs[0], dogs[2] ]
    const actual = getters.poodlesByAge(state, { poodles })(1)

    expect(actual).toEqual([ dogs[0] ])
  })
})
```

Au lieu de passer le vrai getter `poodles`, nous passons le résultat qu'il retournerait. Nous savons déjà que cela fonctionne, puisque nous avons écrit un test pour cela. Cela nous permet de nous concentrer sur le test de la logique propre à `poodlesByAge`.

Il est possible d'avoir des getters `async`. Ils peuvent être testés en utilisant la même technique que les actions `async`, que vous pouvez lire [ici](https://lmiller1990.github.io/vue-testing-handbook/vuex-actions.html).

## Conclusion

- Les `getters` sont juste de simples fonctions JavaScript.
- Lorsque vous testez les `getters` en isolation, vous devez passer l'état manuellement.
- Si un getter utilise un autre getter, vous devriez stub le résultat attendu du premier getter. Cela vous donnera un contrôle plus fin sur le test, et vous permettra de vous concentrer sur le test du getter en question.

Le code source du test décrit sur cette page peut être trouvé [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app-vue-3/tests/unit/getters.spec.js).
