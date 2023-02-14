:::tip Ce livre est écrit pour Vue.js 2 et Vue Test Utils v1.
Vous trouverez la version Vue.js 3 [ici](/v3/fr).
:::

## Réduire le nombre d'essais

> Cette article est disponible en screencast sur [Vue.js Courses](https://vuejs-course.com/screencasts/reducing-duplication-in-tests). Consultez le [ici](https://vuejs-course.com/screencasts/reducing-duplication-in-tests).

L'idéal est souvent de commencer le test unitaire avec une nouvelle copie d'un composant.  
De plus, à mesure que vos applications deviennent plus grandes et plus complexes, il y a des chances que vous ayez des composants avec beaucoup de props différents et éventuellement un nombre de librairie tierce telle que Vuetify, VueRouter et Vuex. Cela peut entrainer l'apparition d'un grand nombre de code passe-partout, c'est à dire de code qui n'est pas directement en relation avec le test.

Dans cet article, on utilise Vuex et VueRouter et on vous montre quelques modèles pour vous aider à réduire la quantité de code  


Le code source du test décrit sur cette page peut être trouvé [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/Posts.spec.js).


## Le composant Post

Voici le composant que nous allons tester. Il affiche un prop `message`, s'il en reçoit un. Il affiche un bouton 'Nouveau Post' si l'utilisateur est identifié ainsi que les postes. A la fois les objets `authentication` et `posts` viennent du store de Vuex. Finalement, il rend des composants `router-link` avec un lien vers le post qu'il affiche.

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

- Le `message` est-il rendu quand le prop est reçu ?
- Les `posts` sont-ils correctement rendus ?
- Le bouton 'New Post' est-il présent quand `autenticated` est `true`, caché quand `false` ?

Idéalement, les tests devraient être aussi concis que possible.

## Les Fonctions Usines de Vuex/VueRouter

Une bonne direction à prendre pour rendre l'application plus testable est d'exporter les fonctions usines de Vuex et de VueRouter. Souvent, vous verrez quelque chose comme ceci :

```js
// store.js

export default new Vuex.Store({ ... })

// router.js
export default new VueRouter({ ... })
```

C'est bien pour une application régulière, mais pas idéale pour les tests. Si vous faite cela, chaque fois que vous utiliserez le store de Vuex ou Router dans un test, il sera partagé avec tous les autres tests qui l'importent également. Idéalement, chaque composant devrait avoir une copie du store et de router.

Un moyen simple de contourner ce problème consiste à exporter une fonction usine - c'est-à-dire une fonction qui renvoie une nouvelle instance de l'objet. Par example:

```js
// store.js
export const store = new Vuex.Store({ ... })
export const createStore = () => {
  return new Vuex.Store({ ... })
}

// router.js
export default new VueRouter({ ... })
export const createRouter = () => {
  return new VueRouter({ ... })
}
```
Maintenant votre application peut importer le store `import { store } from './store.js'` et vos tests peuvent obtenir une nouvelle copie du store à chaque fois en faisant `import { createStore } from './store.js'`, puis de créer l'instance avec `const store = createStore()`. Il en va de même pour le router. C'est ce que je fais dans l'exemple `Posts.vue` - vous trouverez le code pour le store [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/src/createStore.js) et pour le router [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/src/createRouter.js).


## Les Test (avant refactorisation)

Maintenant que nous savons à quoi ressemble `Posts.vue`, le store et le router, nous pouvons comprendre ce que font les tests :

```js
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import { mount, createLocalVue } from '@vue/test-utils'

import Posts from '@/components/Posts.vue'
import { createRouter } from '@/createRouter'
import { createStore } from '@/createStore'

describe('Posts.vue', () => {
  it('renders a message if passed', () => {
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    localVue.use(Vuex)

    const store = createStore()
    const router = createRouter()
    const message = 'New content coming soon!'
    const wrapper = mount(Posts, {
      propsData: { message },
      store, router,
    })

    expect(wrapper.find("#message").text()).toBe('New content coming soon!')
  })

  it('renders posts', async () => {
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    localVue.use(Vuex)

    const store = createStore()
    const router = createRouter()
    const message = 'New content coming soon!'

    const wrapper = mount(Posts, {
      propsData: { message },
      store, router,
    })

    wrapper.vm.$store.commit('ADD_POSTS', [{ id: 1, title: 'Post' }])
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.post').length).toBe(1)
  })
})
```

Cela ne teste pas complètement toutes les conditions ; c'est début mais suffisant pour nous permettre de démarrer. Remarquez la duplication et la répétition - débarrassons-nous de cela.

## Une Fonction Personnalisé `createTestVue`

Les cinq premières lignes de chaque test sont les mêmes :

```js
const localVue = createLocalVue()
localVue.use(VueRouter)
localVue.use(Vuex)

const store = createStore()
const router = createRouter()
```
Réglons cela. Pour ne pas être confondu avec la fonction `createLocalVue` de Vue Test Utils, j'aime appeler ma fonction `createTestVue`. Elle ressemble un peu à cela :

```js
const createTestVue = () => {
  const localVue = createLocalVue()
  localVue.use(VueRouter)
  localVue.use(Vuex)

  const store = createStore()
  const router = createRouter()
  return { store, router, localVue }
}
```
Maintenant que nous avons encapsuler toute la logique dans une simple fonction. Nous retournons `store`, `router` et `localeVue` depuis que nous devons les passer à la fonction `mount`.

Si nous refactorisons le premier test en utilisant `createTestVue`, cela ressemblera à ceci :

```js
it('renders a message if passed', () => {
  const { localVue, store, router } = createTestVue()
  const message = 'New content coming soon!'
  const wrapper = mount(Posts, {
    propsData: { message },
    store,
    router,
    localVue
  })

  expect(wrapper.find("#message").text()).toBe('New content coming soon!')
})
```
Un peu plus concis. Refactorisons le second test, qui utilise le store de Vuex.

```js
it('renders posts', async () => {
  const { localVue, store, router } = createTestVue()
  const wrapper = mount(Posts, {
    store,
    router,
  })

  wrapper.vm.$store.commit('ADD_POSTS', [{ id: 1, title: 'Post' }])
  await wrapper.vm.$nextTick()

  expect(wrapper.findAll('.post').length).toBe(1)
})
```

## Définir une méthode `createWrapper`

Bien que le code ci-dessus soit définitivement une amélioration, en comparaison avec le test précédent, nous pouvons remarquer que la moitié du code est encore dupliqué. Créons une nouvelle méthode, `createWrapper`, pour résoudre ce problème.

```js
const createWrapper = (component, options = {}) => {
  const { localVue, store, router } = createTestVue()
  return mount(component, {
    store,
    router,
    localVue,
    ...options
  })
}
```
Maintenant nous allons juste appelé `createWrapper` et avoir une nouvelle copie du composant, prête à être testée. Nos tests sont vraiment concis maintenant.

```js
it('renders a message if passed', () => {
  const message = 'New content coming soon!'
  const wrapper = createWrapper(Posts, {
    propsData: { message },
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

## Définir le state initial de Vuex

La dernière amélioration que nous pouvons faire est la façon éditer le store de Vuex. Dans une application réelle, votre store sera probablement plus complexe, et devoir faire beaucoup de mutations et des actions avec des `commit` et des `dispatch` afin de mettre son composant dans l'état que vous voulez n'est pas l'idéal. Nous pouvons faire de petit changement dans notre fonction `createStore`, qui facilitera la définition de notre state initial.

```js
const createStore = (initialState = {}) => new Vuex.Store({
  state: {
    authenticated: false,
    posts: [],
    ...initialState
  },
  mutations: {
    // ...
  }
})
```
Nous pouvons maintenant mettre l'état initial souhaité dans la fonction `createStore`. Nous pouvons faire une rapide refactorisation, en fusionnant `createTestVue` et `createWrapper`.

```js
const createWrapper = (component, options = {}, storeState = {}) => {
  const localVue = createLocalVue()
  localVue.use(VueRouter)
  localVue.use(Vuex)
  const store = createStore(storeState)
  const router = createRouter()

  return mount(component, {
    store,
    router,
    localVue,
    ...options
  })
}
```
Maintenant notre test peut être écris comme ceci :

```js
it('renders posts', async () => {
  const wrapper = createWrapper(Posts, {}, {
    posts: [{ id: 1, title: 'Post' }]
  })

  expect(wrapper.findAll('.post').length).toBe(1)
})
```
C'est une grande amélioration ! Nous sommes passés d'un test où environ la moitié du code était standard et pas réellement lié à l'affirmation, à deux lignes ; une pour préparer le composant au test et une autre pour l'affirmation.

Un autre avantage de ce remaniement est nous avons une fonction flexible `createWrapper`, que nous pouvons utiliser pour tous nos tests.



## Améliorations

Il y a d'autres améliorations possibles :

- mise à jour de la fonction `createStore` pour permettre de définir l'état initial des modules Vuex avec l'espacement des noms (namespacing)
- améliorer `createRouter` pour définir des routes spécifiques
- Permettre à l'utilisateur de passer un `shallow` ou un `mount` comme argument à `createWrapper`.


## Conclusion

Nous avons vu dans cette partie :

- L'utilisation des fonctions usines afin d'obtenir une nouvelle instance d'un objet.
- Réduire les doublons et les doubles emplois en extrayant les comportements communs.

Le code source du test décrit sur cette page peut être trouvé [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/Posts.spec.js). Il est également disponible sous forme d'un screencast sur [Vue.js Courses](https://vuejs-course.com/screencasts/reducing-duplication-in-tests).
