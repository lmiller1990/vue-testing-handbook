:::tip Ce livre est écrit pour Vue.js 3 et Vue Test Utils v2.
Vous trouverez la version Vue.js 2 [ici](/fr).
:::

## Tester les mutations

Tester les mutations de manière isolée est très simple, car les mutations ne sont que des fonctions JavaScript ordinaires. Cette page traite du test des mutations de manière isolée. Si vous souhaitez tester les mutations dans le contexte d'un composant qui commet une mutation, consultez [ici](https://lmiller1990.github.io/vue-testing-handbook/vuex-in-components-mutations-and-actions.html).

Le test utilisé dans l'exemple suivant se trouve [ici](https://github.com/lmiller1990/vue-testing-handbook/blob/master/demo-app/tests/unit/mutations.spec.js).

## Création de la mutation

Les mutations ont tendance à suivre un modèle fixe. Obtenir des données, éventuellement faire un traitement, puis assigner les données à l'état. Voici le schéma d'une mutation `ADD_POST`. Une fois implémentée, elle recevra un objet `post` dans le payload, et ajoutera le `post.id` à `state.postIds`. Elle ajoutera également l'objet post à l'objet `state.posts`, où la clé est le `post.id`. Il s'agit d'un modèle courant dans les applications utilisant Vuex.

Nous allons le développer en utilisant le TDD. Le début de la mutation est le suivant :

```js
export default {
  SET_POST(state, { post }) {

  }
}
```

Écrivons le test, et laissons les messages d'erreur guider notre développement :

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

L'exécution de ce test avec `yarn test:unit` donne le message d'échec suivant :

```
FAIL  tests/unit/mutations.spec.js
● SET_POST › adds a post to the state

  expect(received).toEqual(expected)

  Expected value to equal:
    {"postIds": [1], "posts": {"1": {"id": 1, "title": "Post"}}}
  Received:
    {"postIds": [], "posts": {}}
```

Commençons par ajouter le `post.id` à `state.postIds` :

```js
export default {
  SET_POST(state, { post }) {
    state.postIds.push(post.id)
  }
}
```

Maintenant, `yarn test:unit` donne des résultats :

```
Expected value to equal:
  {"postIds": [1], "posts": {"1": {"id": 1, "title": "Post"}}}
Received:
  {"postIds": [1], "posts": {}}
```

`postIds` semble bon. Maintenant, nous devons juste ajouter le message à `state.posts`. En raison du fonctionnement du système de réactivité de Vue, nous ne pouvons pas simplement écrire `post[post.id] = post` pour ajouter le message. Vous trouverez plus de détails [ici](https://vuejs.org/v2/guide/reactivity.html#Change-Detection-Caveats). En fait, vous devez créer un nouvel objet en utilisant `Object.assign` ou l'opérateur `...`. Nous allons utiliser l'opérateur `...` pour assigner le post à `state.posts` :

```js
export default {
  SET_POST(state, { post }) {
    state.postIds.push(post.id)
    state.posts = { ...state.posts, [post.id]: post }
  }
}
```

Maintenant le test est réussi !

## Conclusion

Tester les mutations Vuex ne nécessite rien de spécifique à Vue ou Vuex, puisqu'il s'agit simplement de fonctions JavaScript ordinaires. Il suffit de les importer et de les tester si nécessaire. La seule chose à laquelle il faut faire attention est le système de réactivité de Vue, qui s'applique également à Vuex. Vous pouvez en savoir plus sur le système de réactivité et les avertissements courants [ici](https://vuejs.org/v2/guide/reactivity.html#Change-Detection-Caveats).

La page discutée :

- Les mutations Vuex sont des fonctions JavaScript ordinaires
- Les mutations peuvent, et doivent, être testées indépendamment de l'application Vue principale.

Le test utilisé dans l'exemple ci-dessus peut être trouvé [ici](https://github.com/lmiller1990/vue-testing-handbook/blob/master/demo-app/tests/unit/mutations.spec.js).
