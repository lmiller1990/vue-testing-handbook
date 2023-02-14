:::tip Ce livre est écrit pour Vue.js 2 et Vue Test Utils v1.
Vous trouverez la version Vue.js 3 [ici](/v3/fr).
:::

## Le Test des Actions

Il est très simple de tester des actions isolément. C'est très similaire à l'analyse des mutations seul - voir [ici](https://lmiller1990.github.io/vue-testing-handbook/vuex-mutations.html) pour plus d'information sur le test de mutation. Le test de actions dans le contexte d'un composant sont correctement réparties, voir [ici](https://lmiller1990.github.io/vue-testing-handbook/vuex-in-components-mutations-and-actions.html).

Le code source du test décrit sur cette page peut être trouvé [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/actions.spec.js).

## La création des Actions

Nous allons écrire une action qui suivra le paterne commun de Vuex :
We will write an action that follows a common Vuex pattern:

1. Faire un appel asynchrone d'une API.
2. Effectuer un traitement des données (facultatif).
3. Acter une mutation dont le résultat est un paramètre additionnel

C'est une action d'`authentification`, qui envoie un nom d'utilisateur et un mot de passe à un API externe pour vérifier s'il y a correspondance. Le résultat est ensuite utilisé pour mettre à jour le state en actant une mutation `SET_AUTHENTICATED` avec le résultat en paramètre additionnel.

```js
import axios from "axios"

export default {
  async authenticate({ commit }, { username, password }) {
    const authenticated = await axios.post("/api/authenticate", {
      username, password
    })

    commit("SET_AUTHENTICATED", authenticated)
  }
}
```

Le test d'action devrait affirmer que :

1. Est-ce le  bon point final de l'API qui a été utilisé ?
2. Le paramètre additionnel est-il correct ?
3. La bonne mutation a-t-elle été actée avec le résultat ?

Allons de l'avant et faisons le test, et laissons les messages d'erreur nous guider.

## Écrire le test

```js
describe("authenticate", () => {
  it("authenticated a user", async () => {
    const commit = jest.fn()
    const username = "alice"
    const password = "password"

    await actions.authenticate({ commit }, { username, password })

    expect(url).toBe("/api/authenticate")
    expect(body).toEqual({ username, password })
    expect(commit).toHaveBeenCalledWith(
      "SET_AUTHENTICATED", true)
  })
})
```
Comme `axios` est asynchrone, pour qui Jest attende la fin du test, nous devons le déclarer comme `async` et ensuite `await` l'appel de `actions.authenticate`. Sinon le test finira avant l'affirmation `expect` et nous aurons un test permanent - un test qui ne peut jamais échouer.

L'exécution du test ci-dessus nous donne le message suivant :

```
 FAIL  tests/unit/actions.spec.js
  ● authenticate › authenticated a user

    SyntaxError: The string did not match the expected pattern.

      at XMLHttpRequest.open (node_modules/jsdom/lib/jsdom/living/xmlhttprequest.js:482:15)
      at dispatchXhrRequest (node_modules/axios/lib/adapters/xhr.js:45:13)
      at xhrAdapter (node_modules/axios/lib/adapters/xhr.js:12:10)
      at dispatchRequest (node_modules/axios/lib/core/dispatchRequest.js:59:10)
```
Cette erreur vient d'`axios`. Nous faisons une requête à `/api...` et comme nous sommes dans un environnement de test, il n'y a pas de serveur auquel faire une requête, d'où l'erreur. Nous n'avons pas défini l'`url` ou le `body`- nous le ferons pendant que nous résolvons l'erreur `axios`.

Puisque nous utilisons Jest, nous pouvons facilement faire une simulation de l'API en utilisant `jest.mock`. Nous utiliserons une simulation de `axios` à la place d'une vrai, qui nous donnera plus de contrôle sur son comportement. Jest fournit [ES6 Class Mocks](https://jestjs.io/docs/en/es6-class-mocks), qui convient parfaitement pour les simulations d'`axios`.

Le simulateur d'`axios` ressemble à ceci :

```js
let url = ''
let body = {}

jest.mock("axios", () => ({
  post: (_url, _body) => {
    return new Promise((resolve) => {
      url = _url
      body = _body
      resolve(true)
    })
  }
}))
```
Nous sauvegardons les variables `url` et `body` pour pouvoir affirmer que le point final reçoit les bons paramètres additionnels. Comme nous ne voulons pas réellement atteindre le point final, nous résolvons la promesse immédiatement qui simule un appel API réussi.

Le test `yarn unit:pass` est maintenant réussi !

## Le test de l'erreur API

Nous avons seulement testé le cas où l'API a réussi. Il est important de tester tous les résultats possibles. Ecrivons un test pour le cas où une erreur se produit. Cette fois, nous allons écrire le test en premier, puis la mise en œuvre.

Le test peut être écrit de cette façon :

```js
it("catches an error", async () => {
  mockError = true

  await expect(actions.authenticate({ commit: jest.fn() }, {}))
    .rejects.toThrow("API Error occurred.")
})
```
Nous devons trouver un moyen de forcer la simulation d'`axios` de renvoyer une erreur. C'est à cela que la variable `mockError` sert. Mettez à jour la simulation d'`axios` comme ceci :

```js
let url = ''
let body = {}
let mockError = false

jest.mock("axios", () => ({
  post: (_url, _body) => {
    return new Promise((resolve) => {
      if (mockError)
        throw Error()

      url = _url
      body = _body
      resolve(true)
    })
  }
}))
```
Jest ne permettra d'accéder à une variable hors du champ dans une simulation de classe ES6 qui si le nom de la variable est précédé de `mock`. Maintenant, nous pouvons simplement faire `mockError = true` et `axios` lancera l'erreur.

L’exécution de ce test nous donne cette erreur :

```
FAIL  tests/unit/actions.spec.js
● authenticate › catchs an error

  expect(function).toThrow(string)

  Expected the function to throw an error matching:
    "API Error occurred."
  Instead, it threw:
    Mock error
```

Il a réussi à détecter une erreur ... mais pas celle que l'on attendait. Mettez à jour l'`authenticate` afin d'avoir l'erreur que le test attend :

```js
export default {
  async authenticate({ commit }, { username, password }) {
    try {
      const authenticated = await axios.post("/api/authenticate", {
        username, password
      })

      commit("SET_AUTHENTICATED", authenticated)
    } catch (e) {
      throw Error("API Error occurred.")
    }
  }
}
```
Maintenant, le test est réussi.

## Améliorations

Maintenant que vous savez comment tester des actions de manière isolée. Il y a au moins une amélioration potentielle qui peut être apportée, qui est de mettre la simulation d'`axios` comme [modèle manuel](https://jestjs.io/docs/en/manual-mocks). Cela implique de créer un répertoire `__mock__` au même niveau que `node_modules` d'y implémenter le module de simulation. En faisant cela, vous pouvez partager l’implémentation de la maquette avec tous vos tests. Jest va automatiquement utiliser `__mock__`. Vous trouverez de nombreux exemples sur le site de Jest et sur internet pour savoir comment faire. La correction de ce test pour utiliser la simulation manuelle est laissé à l'appréciation du lecteur.

## Conclusion

Dans ce guide nous avons vu :

- L'utilisation des simulations de classe Jest d'ES6.
- Le test des cas de réussite aussi bien que d'échec d'une action.

Le code source du test décrit sur cette page peut être trouvé [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/actions.spec.js).
