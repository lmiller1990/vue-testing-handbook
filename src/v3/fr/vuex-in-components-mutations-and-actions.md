:::tip Ce livre est écrit pour Vue.js 3 et Vue Test Utils v2.
Vous trouverez la version Vue.js 2 [ici](/fr).
:::

## Mutations et actions

Le chapitre précédent traitait du test des composants qui utilisent `$store.state` et `$store.getters`, qui fournissent tous deux l'état actuel au composant. Lorsque l'on affirme qu'un composant commet correctement une mutation ou distribue une action, ce que nous voulons vraiment faire est d'affirmer que `$store.commit` et `$store.dispatch` est appelé avec le bon handler (la mutation ou l'action à appeler) et le bon payload.

Il y a deux façons de procéder. La première consiste à utiliser un vrai magasin Vuex avec `createStore`, et la seconde consiste à utiliser un magasin factice. Ces deux techniques sont démontrées [ici](https://lmiller1990.github.io/vue-testing-handbook/vuex-in-components.html). Voyons-les à nouveau, dans le contexte des mutations et des actions.

Le code source du test décrit sur cette page peut être trouvé [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app-vue-3/tests/unit/ComponentWithButtons.spec.js).

## Créer le composant

Pour ces exemples, nous allons tester un composant `<ComponentWithButtons>` :

```vue
<template>
  <div>
    <button 
      class="commit" 
      @click="handleCommit">
      Commit
    </button>

    <button 
      class="dispatch" 
      @click="handleDispatch">
      Dispatch
    </button>

    <button 
      class="namespaced-dispatch" 
      @click="handleNamespacedDispatch">
      Namespaced Dispatch
    </button>
  </div>
</template>

<script>
export default {
  name: "ComponentWithButtons",

  methods: {
    handleCommit() {
      this.$store.commit("testMutation", { msg: "Test Commit" })
    },

    handleDispatch() {
      this.$store.dispatch("testAction", { msg: "Test Dispatch" })
    },

    handleNamespacedDispatch() {
      this.$store.dispatch("namespaced/very/deeply/testAction", { msg: "Test Namespaced Dispatch" })
    }
  }
}
</script>
```

## Test avec un vrai magasin Vuex

Écrivons un `ComponentWithButtons.spec.js` avec un test pour la mutation en premier. Rappelez-vous, nous voulons vérifier deux choses :

1. La bonne mutation a-t-elle été validée ?
2. La charge utile était-elle correcte ?

Voyons le test.

```js
import { createStore } from "vuex"
import { mount } from "@vue/test-utils"
import ComponentWithButtons from "../../src/components/ComponentWithButtons.vue"

const mutations = {
  testMutation: jest.fn()
}

const store = createStore({
  mutations
})

describe("ComponentWithButtons", () => {

  it("commits a mutation when a button is clicked", async () => {
    const wrapper = mount(ComponentWithButtons, {
      global: {
        plugins: [store]
      }
    })

    wrapper.find(".commit").trigger("click")
    await wrapper.vm.$nextTick()    

    expect(mutations.testMutation).toHaveBeenCalledWith(
      {},
      { msg: "Test Commit" }
    )
  })
})
```

Remarquez que les tests sont marqués `await` et appellent `nextTick`. Voir [ici](/simulating-user-input.html#writing-the-test) pour plus de détails sur le pourquoi.

Il y a beaucoup de code dans le test ci-dessus - rien de très excitant ne se passe, cependant. Nous créons un nouveau magasin avec `createStore`, en passant une fonction fictive Jest (`jest.fn()`) à la place de `testMutation`. Les mutations Vuex sont toujours appelées avec deux arguments : le premier est l'état actuel, et le second est la charge utile. Puisque nous n'avons pas déclaré d'état pour le magasin, nous nous attendons à ce qu'il soit appelé avec un objet vide. Le second argument est censé être `{ msg : "Test Commit" }`, qui est codé en dur dans le composant.

C'est beaucoup de code passe-partout à écrire, mais c'est un moyen correct et valide de vérifier que les composants se comportent correctement. Une autre alternative qui nécessite moins de code est l'utilisation d'un magasin factice. Voyons comment le faire tout en écrivant un test pour affirmer que `testAction` est distribué.

## Test avec un magasin factice

Voyons le code, puis comparons-le au test précédent. Rappelez-vous, nous voulons vérifier

1. l'action correcte est envoyée
2. que la charge utile est correcte

```js
it("dispatch a namespaced action when button is clicked", async () => {
  const store = createStore()
  store.dispatch = jest.fn()

  const wrapper = mount(ComponentWithButtons, {
    global: {
      plugins: [store]
    }
  })

  wrapper.find(".namespaced-dispatch").trigger("click")
  await wrapper.vm.$nextTick()

  expect(store.dispatch).toHaveBeenCalledWith(
    'namespaced/very/deeply/testAction',
    { msg: "Test Namespaced Dispatch" }
  )
})
```

C'est beaucoup plus compact que l'exemple précédent. Pas de `createStore`. Au lieu de simuler la fonction, comme dans l'exemple précédent où nous avons fait `testMutation = jest.fn()`, nous simulons la fonction `dispatch` elle-même. Puisque `$store.dispatch` est juste une fonction JavaScript ordinaire, nous pouvons le faire. Ensuite, nous affirmons que le bon gestionnaire d'action, `testAction`, est le premier argument, et que le second argument, la charge utile, est correct. Nous ne nous soucions pas de ce que l'action fait réellement - cela peut être testé isolément. Le but de ce test est de vérifier simplement que cliquer sur un bouton envoie l'action correcte avec le payload.

Que vous utilisiez un magasin réel ou un magasin factice pour vos tests est une question de préférence personnelle. Les deux sont corrects. L'important est que vous testiez vos composants.

## Tester une action (ou une mutation) avec un espace de nom

Le troisième et dernier exemple montre une autre façon de tester qu'une action a été envoyée (ou une mutation effectuée) avec les bons arguments. Cela combine les deux techniques discutées ci-dessus - un vrai magasin `Vuex`, et une méthode `dispatch` simulée.


```js
it("dispatch a namespaced action when button is clicked", async () => {
  const store = createStore()
  store.dispatch = jest.fn()

  const wrapper = mount(ComponentWithButtons, {
    global: {
      plugins: [store]
    }
  })

  wrapper.find(".namespaced-dispatch").trigger("click")
  await wrapper.vm.$nextTick()

  expect(store.dispatch).toHaveBeenCalledWith(
    'namespaced/very/deeply/testAction',
    { msg: "Test Namespaced Dispatch" }
  )
})
```

Nous commençons par créer un magasin Vuex, avec le(s) module(s) qui nous intéresse(nt). Je déclare le module `namespacedModule` dans le test, mais dans une application réelle, vous importeriez simplement les modules dont dépend votre composant. Nous remplaçons ensuite la méthode `dispatch` par un mock `jest.fn`, et nous faisons des affirmations contre cela.

## Conclusion

Dans cette section, nous avons couvert :

1. L'utilisation de Vuex avec un `createStore` et la simulation d'une mutation.
2. Mocking de l'API Vuex (`dispatch` et `commit`)
3. Utilisation d'un magasin Vuex réel avec une fonction fictive `dispatch`.

Le code source du test décrit sur cette page peut être trouvé [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app-vue-3/tests/unit/ComponentWithButtons.spec.js).
