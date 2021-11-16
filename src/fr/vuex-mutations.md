:::tip Ce livre est écrit pour Vue.js 2 et Vue Test Utils v1.
Vous trouverez la version Vue.js 3 [ici](/v3/fr).
:::

## Tester les Mutations

Il est très simple de tester les mutations de manières isolées, car les mutations sont des fonctions Javascript normale. Cette page traite du test des mutations de façon isolée. Si vous voulez tester les mutations dans le contexte d'un composant qui acte une mutation, voir [ici](https://lmiller1990.github.io/vue-testing-handbook/vuex-in-components-mutations-and-actions.html).


Le test utilisé dans l'exemple suivant peut être trouvé [ici](https://github.com/lmiller1990/vue-testing-handbook/blob/master/demo-app/tests/unit/mutations.spec.js).

## Créer la Mutation
Les mutations ont tendance à suivre un modèle déterminé. Obtenez des données, faites peut-être un traitement, puis assignez les données au state. Voici les grandes lignes d'une mutation `ADD_POST`. Une fois implémenté, il recevra un objet `post` en paramètre additionnel, et ajoutera le `post.id` à `state.postIds`. Il ajoutera aussi l'objet post à l'objet `state.posts`, dont la clé est le `post.id`. C'est un schéma courant dans les applications utilisant Vuex.

Nous allons le développer en utilisant TDD. Le début de la mutation est le suivant :

```js
export default {
  SET_POST(state, { post }) {

  }
}
```
Passons le test, et laissons les messages d'erreur guider notre développement :

```js
import mutations from "@/store/mutations.js"

describe("SET_POST", () => {
  it("adds a post to the state", () => {
    const post = { id: 1, title: "Post" }
    const state = {
      postIds: [],
      posts: {}
    }

    mutations.SET_POST(state, { post })

    expect(state).toEqual({
      postIds: [1],
      posts: { "1": post }
    })
  })
})
```
L'exécution du test avec `yarn test:unit` donne le message suivant :

```
FAIL  tests/unit/mutations.spec.js
● SET_POST › adds a post to the state

  expect(received).toEqual(expected)

  Expected value to equal:
    {"postIds": [1], "posts": {"1": {"id": 1, "title": "Post"}}}
  Received:
    {"postIds": [], "posts": {}}
```
Commençons par ajouter le `post.id` à `state.postIds`:


```js
export default {
  SET_POST(state, { post }) {
    state.postIds.push(post.id)
  }
}
```
Maintenant `yarn test:unit` produit :

```
Expected value to equal:
  {"postIds": [1], "posts": {"1": {"id": 1, "title": "Post"}}}
Received:
  {"postIds": [1], "posts": {}}
```
Les `postIds` ont l'aire bien. Il ne nous reste plus qu'à ajouter le message à `state.posts`. A cause de la façon dont le système de réactivité de Vue fonctionne, nous ne pouvons pas simplement écrire `post[post.id] = post` pour ajouter le message. Plus de détails peuvent être trouvés [ici](https://vuejs.org/v2/guide/reactivity.html#Change-Detection-Caveats). Basiquement, vous devez créer un nouvel objet en utilisant `Object.assign` ou l'opérateur `...`. Nous utiliserons l'opérateur `...` pour assigner le message à `state.posts`:

```js
export default {
  SET_POST(state, { post }) {
    state.postIds.push(post.id)
    state.posts = { ...state.posts, [post.id]: post }
  }
}
```

Maintenant, le test est réussi !

## Conclusion

Le test des mutations de Vuex nécessite rien de bien spécifique à Vue ou à Vuex, puisqu'il s'agit simplement de fonctions JavaScript. Il suffit de les importer et de les tester. La seule chose à laquelle il faut faire attention, ce sont les avertissements de réactivité de Vue, qui s'appliquent également à Vuex. Vous pouvez en savoir plus sur le système de réactivité et les avertissements courants [ici](https://vuejs.org/v2/guide/reactivity.html#Change-Detection-Caveats).


Nous avons vu sur cette page :

- Les mutations de Vuex sont des fonctions JavaScript régulière.
- Les mutations peuvent, et doivent, être tester indépendamment de l'application principale Vue.

Le test utilisé dans l'exemple ci-dessus peut être consulté [ici](https://github.com/lmiller1990/vue-testing-handbook/blob/master/demo-app/tests/unit/mutations.spec.js).
