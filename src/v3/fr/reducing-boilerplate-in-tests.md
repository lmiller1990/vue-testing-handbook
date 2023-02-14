:::tip Ce livre est écrit pour Vue.js 3 et Vue Test Utils v2.
Vous trouverez la version Vue.js 2 [ici](/fr).
:::

## Réduire le Boilerplate dans les tests

> Cet article est disponible sous forme de screencast sur [Vue.js Courses](https://vuejs-course.com/screencasts/reducing-duplication-in-tests). Consultez-le [ici](https://vuejs-course.com/screencasts/reducing-duplication-in-tests).

Il est souvent idéal de commencer chaque test unitaire avec une nouvelle copie d'un composant. En outre, à mesure que vos applications deviennent plus grandes et plus complexes, il y a de fortes chances que vous ayez installé des composants avec de nombreux props différents, et peut-être un certain nombre de bibliothèques tierces telles que Vuetify, VueRouter et Vuex. Cela peut faire en sorte que vos tests contiennent beaucoup de code passe-partout, c'est-à-dire du code qui n'est pas directement lié au test.

Cet article prend le composant utilisant Vuex et VueRouter et démontre quelques modèles pour vous aider à réduire la quantité de code de configuration pour vos tests unitaires.

Le code source du test décrit sur cette page se trouve [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app-vue-3/tests/unit/Posts.spec.js).

## Le composant Posts

C'est le composant que nous allons tester. Il affiche un prop `message`, si un message est reçu. Il affiche un bouton New Post si l'utilisateur est authentifié et quelques posts. Les deux objets `authenticated` et `posts` proviennent du magasin Vuex. Enfin, il rend le composant `router-link`, montrant un lien vers un message.

```vue
<template>
  <div>
    <div id="message" v-if="message">{{ message }}</div>

    <div v-if="authenticated">
      <router-link 
        class="new-post" 
        to="/posts/new"
      >
        New Post
      </router-link>
    </div>

    <h1>Posts</h1>
    <div 
      v-for="post in posts" 
      :key="post.id" 
      class="post"
    >
      <router-link :to="postLink(post.id)">
        {{ post.title }}
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Posts',
  props: {
    message: String,
  },

  computed: {
    authenticated() {
      return this.$store.state.authenticated
    },

    posts() {
      return this.$store.state.posts
    }
  },

  methods: {
    postLink(id) {
      return `/posts/${id}`
    }
  }
}
</script>
```

Nous voulons tester :

- le `message` est-il rendu lorsqu'une prop est reçue ?
- Les `posts` sont-ils correctement affichés ?
- Le bouton "New Post" est-il affiché lorsque "authentifié" est "vrai" et caché lorsque `false` ?

Idéalement, les tests devraient être aussi concis que possible.

## Fonctions d'usine Vuex/VueRouter

Un bon moyen de rendre vos applications plus testables est d'exporter des fonctions d'usine pour Vuex et VueRouter. Souvent, vous verrez quelque chose comme :

```js
// store.js

export default createStore({ ... })

// router.js
export default createRouter({ ... })
```

C'est très bien pour une application normale, mais pas idéal pour les tests. Si vous procédez ainsi, chaque fois que vous utilisez le magasin ou le routeur dans un test, il sera partagé par tous les autres tests qui l'importent également. Idéalement, chaque composant devrait obtenir une nouvelle copie du magasin et du routeur.

Une façon simple de contourner ce problème est d'exporter une fonction d'usine - une fonction qui renvoie une nouvelle instance d'un objet. Par exemple :

```js
// store.js
export const store = createStore({ ... })
export const createVuexStore = () => {
  return new createStore({ ... })
}

// router.js
export default createRouter({ ... })
export const createVueRouter = () => {
  return createRouter({ ... })
}
```

Maintenant votre application principale peut faire `import { store } de './store.js`, et vos tests peuvent obtenir une nouvelle copie du magasin à chaque fois en faisant `import { createVuexStore } de './store.js`, puis en créant une instance avec `const store = createStore()`. Il en va de même pour le routeur. C'est ce que je fais dans l'exemple `Posts.vue` - le code du magasin se trouve [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app-vue-3/src/createStore.js) et le routeur [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app-vue-3/src/createRouter.js).

## Les tests (avant refactorisation)

Maintenant que nous savons à quoi ressemblent `Posts.vue`, le magasin et le routeur, nous pouvons comprendre ce que font les tests :

```js
import { mount } from '@vue/test-utils'

import Posts from '@/components/Posts.vue'
import { createVueRouter } from '@/createRouter'
import { createVuexStore } from '@/createStore'

describe('Posts.vue', () => {
  it('renders a message if passed', () => {
    const store = createVuexStore()
    const router = createVueRouter()
    const message = 'New content coming soon!'
    const wrapper = mount(Posts, {
      global: {
        plugins: [store, router]
      },
      props: { message },
    })

    expect(wrapper.find("#message").text()).toBe('New content coming soon!')
  })

  it('renders posts', async () => {
    const store = createVuexStore()
    const router = createVueRouter()
    const message = 'New content coming soon!'
    const wrapper = mount(Posts, {
      global: {
        plugins: [store, router]
      },
      props: { message },
    })

    wrapper.vm.$store.commit('ADD_POSTS', [{ id: 1, title: 'Post' }])
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.post').length).toBe(1)
  })
})
```

Ce n'est pas un test complet de toutes les conditions ; c'est un exemple minimal, et suffisant pour nous permettre de commencer. Remarquez la duplication et la répétition - débarrassons-nous de cela.

## Une fonction `createWrapper` personnalisée

Les quelques lignes de chaque test sont les mêmes :

```js
const store = createVuexStore(storeState)
const router = createVueRouter()

return mount(component, {
  global: {
    plugins: [store, router]
  },
  props: { ... }
})
```

Réparons cela avec une fonction appelée `createWrapper`. Cela ressemble à quelque chose comme ceci :

```js
const createWrapper = () => {
  const store = createStore()
  const router = createRouter()
  return { store, router }
}
```

Maintenant nous avons encapsulé toute la logique dans une seule fonction. Nous retournons le `store`, et le `router` puisque nous devons les passer à la fonction `mount`. 

Si nous refactorons le premier test en utilisant `createWrapper`, il ressemble à ceci :

```js
it('renders a message if passed', () => {
  const { store, router } = createWrapper()
  const message = 'New content coming soon!'
  const wrapper = mount(Posts, {
    global: {
      plugins: [store, router],
    },
    props: { message },
  })

  expect(wrapper.find("#message").text()).toBe('New content coming soon!')
})
```

C'est un peu plus concis. Refactorons le deuxième test, qui utilise le magasin de Vuex.

```js
it('renders posts', async () => {
  const { store, router } = createWrapper()
  const wrapper = mount(Posts, {
    global: {
      plugins: [store, router],
    }
  })

  wrapper.vm.$store.commit('ADD_POSTS', [{ id: 1, title: 'Post' }])
  await wrapper.vm.$nextTick()

  expect(wrapper.findAll('.post').length).toBe(1)
})
```

## Amélioration de la fonction `createWrapper`.

Bien que le code ci-dessus soit définitivement une amélioration, en le comparant au test précédent, nous pouvons remarquer qu'environ la moitié du code est toujours dupliquée. Traitons ce problème en mettant à jour la fonction `createWrapper` pour qu'elle gère également le montage du composant.

```js
const createWrapper = (component, options = {}) => {
  const store = createVuexStore()
  const router = createVueRouter()

  return mount(component, {
    global: {
      plugins: [store, router],
    },
    ...options
  })
}
```

Maintenant, nous pouvons simplement appeler `createWrapper` et avoir une copie fraîche du composant, prête pour les tests. Nos tests sont très concis maintenant.

```js
it('renders a message if passed', () => {
  const message = 'New content coming soon!'
  const wrapper = createWrapper(Posts, {
    props: { message },
  })

  expect(wrapper.find("#message").text()).toBe('New content coming soon!')
})

it('renders posts', async () => {
  const wrapper = createWrapper(Posts)

  wrapper.vm.$store.commit('ADD_POSTS', [{ id: 1, title: 'Post' }])
  await wrapper.vm.$nextTick()

  expect(wrapper.findAll('.post').length).toBe(1)
})
```

## Définir l'état initial de Vuex

La dernière amélioration que nous pouvons apporter concerne la façon dont nous remplissons le magasin Vuex. Dans une application réelle, votre magasin est susceptible d'être complexe, et avoir à `commit` et `dispatch` de nombreuses mutations et actions différentes pour obtenir votre composant dans l'état que vous voulez tester n'est pas idéal. Nous pouvons apporter une petite modification à notre fonction `createVuexStore`, qui rend plus facile la définition de l'état initial :

```js
const createVuexStore = (initialState = {}) => createStore({
  state() {
    return {
        authenticated: false,
        posts: [],
        ...initialState
    },
  },
  mutations: {
    // ...
  }
})
```

Maintenant nous pouvons donner l'état initial désiré à la fonction `createVuexStore` via `createWrapper` :

```js
const createWrapper = (component, options = {}, storeState = {}) => {
  const store = createVuexStore(storeState)
  const router = createVueRouter()

  return mount(component, {
    global: {
      plugins: [store, router],
    },
    ...options
  })
}
```

Notre test peut maintenant être écrit comme suit :

```js
it('renders posts', async () => {
  const wrapper = createWrapper(Posts, {}, {
    posts: [{ id: 1, title: 'Post' }]
  })

  expect(wrapper.findAll('.post').length).toBe(1)
})
```

C'est une grande amélioration ! Nous sommes passés d'un test où environ la moitié du code était un passe-partout, et n'était pas réellement lié à l'assertion, à deux lignes ; une pour préparer le composant pour le test, et une pour l'assertion. 

Un autre bonus de cette refactorisation est que nous avons une fonction flexible `createWrapper`, que nous pouvons utiliser pour tous nos tests.

## Améliorations

Il y a quelques autres améliorations potentielles :

- mettre à jour la fonction `createVuexStore` pour permettre de définir l'état initial pour les modules Vuex namespaced
- améliorer `createVueRouter` pour définir une route spécifique
- Permettre à l'utilisateur de passer un argument `shallow` ou `mount` à `createWrapper`. 

## Conclusion

Ce guide a abordé :

- l'utilisation des fonctions de fabrique pour obtenir une nouvelle instance d'un objet
- la réduction de l'excès et de la duplication en extrayant les comportements communs.

Le code source du test décrit sur cette page est disponible [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app-vue-3/tests/unit/Posts.spec.js). Il est également disponible sous forme de screencast sur [Cours Vue.js](https://vuejs-course.com/screencasts/reducing-duplication-in-tests).
