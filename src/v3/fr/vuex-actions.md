:::tip Ce livre est écrit pour Vue.js 3 et Vue Test Utils v2.
Vous trouverez la version Vue.js 2 [ici](/fr).
:::

## Tester les actions

Tester les actions de manière isolée est très simple. C'est très similaire au test des mutations en isolation - voir [ici](https://lmiller1990.github.io/vue-testing-handbook/vuex-mutations.html) pour plus d'informations sur le test des mutations. Le test des actions dans le contexte d'un composant qui les distribue correctement est abordé [ici](https://lmiller1990.github.io/vue-testing-handbook/vuex-in-components-mutations-and-actions.html).

Le code source du test décrit sur cette page se trouve [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app-vue-3/tests/unit/actions.spec.js).

## Création de l'action

Nous allons écrire une action qui suit un modèle Vuex commun :

1. faire un appel asynchrone à une API
2. effectuer un traitement sur les données (facultatif)
3. effectuer une mutation avec le résultat comme charge utile.

Il s'agit d'une action `authenticate`, qui envoie un nom d'utilisateur et un mot de passe à une API externe pour vérifier s'ils correspondent. Le résultat est ensuite utilisé pour mettre à jour l'état en engageant une mutation `SET_AUTHENTICATED` avec le résultat comme charge utile.

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

Le test d'action doit affirmer :

1. le bon point de terminaison de l'API a-t-il été utilisé ?
2. la charge utile est correcte ?
3. la mutation correcte a-t-elle été engagée avec le résultat ?

Allons-y, écrivons le test, et laissons les messages d'échec nous guider.

## Rédaction du test

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

Comme `axios` est asynchrone, pour s'assurer que Jest attende la fin du test, nous devons le déclarer comme `async` et ensuite `await` l'appel à `actions.authenticate`. Sinon le test se terminera avant l'affirmation `expect`, et nous aurons un test evergreen - un test qui ne peut jamais échouer.

L'exécution du test ci-dessus nous donne le message d'échec suivant :

```
 FAIL  tests/unit/actions.spec.js
  ● authenticate › authenticated a user

    SyntaxError: The string did not match the expected pattern.

      at XMLHttpRequest.open (node_modules/jsdom/lib/jsdom/living/xmlhttprequest.js:482:15)
      at dispatchXhrRequest (node_modules/axios/lib/adapters/xhr.js:45:13)
      at xhrAdapter (node_modules/axios/lib/adapters/xhr.js:12:10)
      at dispatchRequest (node_modules/axios/lib/core/dispatchRequest.js:59:10)
```

Cette erreur vient de quelque part dans `axios`. Nous faisons une requête vers `/api...`, et comme nous fonctionnons dans un environnement de test, il n'y a même pas de serveur vers lequel faire une requête, d'où l'erreur. Nous n'avons pas non plus défini `url` ou `body` - nous le ferons pendant que nous résolvons l'erreur `axios`.

Puisque nous utilisons Jest, nous pouvons facilement simuler l'appel à l'API en utilisant `jest.mock`. Nous utiliserons un simulateur `axios` au lieu du vrai, ce qui nous donnera plus de contrôle sur son comportement. Jest fournit des [ES6 Class Mocks](https://jestjs.io/docs/en/es6-class-mocks), qui sont parfaitement adaptés pour simuler `axios`.

L'objet fictif `axios` ressemble à ceci :

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

Nous sauvegardons `url` et `body` dans des variables afin de pouvoir affirmer que le bon endpoint reçoit le bon payload. Puisque nous ne voulons pas réellement atteindre un point de terminaison réel, nous résolvons la promesse immédiatement, ce qui simule un appel d'API réussi.

`yarn unit:pass` produit maintenant un test qui passe !

## Test pour l'erreur d'API

Nous n'avons testé que le cas où l'appel API a réussi. Il est important de tester tous les résultats possibles. Écrivons un test pour le cas où une erreur se produit. Cette fois, nous allons d'abord écrire le test, puis l'implémentation.

Le test peut être écrit comme suit :

```js
it("catches an error", async () => {
  mockError = true

  await expect(actions.authenticate({ commit: jest.fn() }, {}))
    .rejects.toThrow("API Error occurred.")
})
```

Nous devons trouver un moyen de forcer l'objet fictif `axios` à lancer une erreur. C'est à cela que sert la variable `mockError`. Mettez à jour l'objet fictif `axios` comme ceci :


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

Jest ne permet d'accéder à une variable hors de portée dans une classe ES6 mock que si le nom de la variable est précédé de `mock`. Maintenant nous pouvons simplement faire `mockError = true` et `axios` lancera une erreur.

L'exécution de ce test nous donne cette erreur :

```
FAIL  tests/unit/actions.spec.js
● authenticate › catchs an error

  expect(function).toThrow(string)

  Expected the function to throw an error matching:
    "API Error occurred."
  Instead, it threw:
    Mock error
```

Il a réussi à attraper une erreur... mais pas celle que nous attendions. Mettez à jour `authenticate` pour qu'il lance l'erreur attendue par le test :

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

Maintenant le test passe.

## Améliorations

Maintenant vous savez comment tester des actions de manière isolée. Il y a au moins une amélioration potentielle qui peut être faite, qui est d'implémenter l'objet fantaisie `axios` comme un [manual mock](https://jestjs.io/docs/en/manual-mocks). Cela implique de créer un répertoire `__mocks__` au même niveau que `node_modules` et d'y implémenter le module mock. En faisant cela, vous pouvez partager l'implémentation de mock à travers tous vos tests. Jest utilisera automatiquement une implémentation de l'objet fantaisie `__mocks__`. Il y a beaucoup d'exemples sur le site de Jest et autour de l'internet sur la façon de le faire. Le refactoring de ce test pour utiliser un mock manuel est laissé comme un exercice au lecteur.

## Conclusion

Ce guide a abordé :

- l'utilisation de mocks de classes Jest ES6
- tester à la fois les cas de succès et d'échec d'une action

Le code source du test décrit sur cette page peut être trouvé [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app-vue-3/tests/unit/actions.spec.js).
