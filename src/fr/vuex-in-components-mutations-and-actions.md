:::tip Ce livre est écrit pour Vue.js 2 et Vue Test Utils v1.
Vous trouverez la version Vue.js 3 [ici](/v3/fr).
:::

## Les Mutations et les Actions

Le guide précédant traitait du test des composants qui utilisent `$store.state` et `$store.gettres`, qui fournissent tous deux l'état actuel du composant. Lorsque l'affirmation d'un composant acter correctement une mutation ou propage une action, ce que nous voulons vraiment faire est d'affirmer que `$store.commit` et `$store.dispatch` est appelé  avec le bon gestionnaire (la mutation ou l'action appeler) et le paramètre additionnel.

Il y a deux façons de procéder. La première consiste à utiliser le store de Vuex avec `createLocalVue`, et la seconde est d'utiliser un store fictif. Ces deux techniques sont présentées [ici](https://lmiller1990.github.io/vue-testing-handbook/vuex-in-components.html). Voyons-les à nouveau, dans le contexte des mutations et des actions.

Le code source du test décrit sur cette page peut être trouvé [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/ComponentWithButtons.spec.js).

## Créer le composant

Pour ces exemples, nous testerons un composant `<ComponentWithButtons>` :


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

## Tester avec un réel store de Vuex

Ecrivons d'abord un `ComponentWithButtons.spec.js` avec un test pour la première mutation. N'oubliez pas, nous voulons vérifier deux choses :

1. La bonne mutation a-t-elle été actée ?
2. Le paramètre additionnel était-il correct ?

Nous utiliserons `createLocalVue` pour ne pas polluer notre instance globale de Vue.


```js
import Vuex from "vuex"
import { createLocalVue, mount } from "@vue/test-utils"
import ComponentWithButtons from "@/components/ComponentWithButtons.vue"

const localVue = createLocalVue()
localVue.use(Vuex)

const mutations = {
  testMutation: jest.fn()
}

const store = new Vuex.Store({ mutations })

describe("ComponentWithButtons", () => {

  it("commits a mutation when a button is clicked", async () => {
    const wrapper = mount(ComponentWithButtons, {
      store, localVue
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

Notez que les tests sont notés `await` et s'appellent `nextTick`. Voir [ici](/simulating-user-input.html#writing-the-test) pour avoir plus de détails sur les raisons.

Il y a beaucoup de code dans le test ci-dessus - mais rien de très excitant ne se passe. Nous créons une `localVue` et utilisons Vuex, puis créons un store, en passant par une fonction de simulation de Jest (`jest.fn()`) à la place de `testMutation`. Les mutations de Vuex sont toujours appelées avec deux arguments : le premier est l'état actuel, et le second est le paramètre additionnel. Comme nous n'avons pas déclarer d'état pour le store, nous nous attendons à ce qu'il soit appelé avec un objet vide. Le second argument devrait être `{ msg: "Test Commit" }`, qui est codé en dur dans le composant.

C'est beaucoup de code à écrire, mais c'est un moyen correct et valable de vérifier que les composants se comportent correctement. Une autre alternative qui nécessite moins de code est l'utilisation d'un store fictif. Voyons comment faire cela pendant l'écriture d'un test pour affirmer que `testAction` est envoyé.

##Tester l'utilisation d'un store fictif

Regardons le code, puis comparons-le au test précédent. N'oubliez pas que nous voulons vérifier :

1. La bonne mutation a-t-elle été actée ?
2. Le paramètre additionnel était-il correct ?

```js
it("dispatches an action when a button is clicked", async () => {
  const mockStore = { dispatch: jest.fn() }
  const wrapper = mount(ComponentWithButtons, {
    mocks: {
      $store: mockStore
    }
  })

  wrapper.find(".dispatch").trigger("click")
  await wrapper.vm.$nextTick()

  expect(mockStore.dispatch).toHaveBeenCalledWith(
    "testAction" , { msg: "Test Dispatch" })
})
```
Il est plus concis que l'exemple précédent.  Pas `localVue`, ni de `Vuex` - au lieu d'une simulation de fonction, dans le test précédent ou nous avions fait `testMutation = jest.fn()`, nous simulons en fait la fonction `dispatch` elle-même. Puisque `$store.dispatch` est juste une fonction JavaScript normale, nous sommes capables de faire cela. Ensuite nous affirmons gestionnaire d'actions correct, `testActions`, est le premier argument, et le second argument, le paramètre additionnel, est correcte. Nous ne nous soucions pas de ce que l'action fait réellement - cela peut être testé de manière isolée. Le but de ce test est de simplement vérifier que le fait de cliquer sur un bouton envoie l'action correct avec le paramètre additionnel.

Que vous utilisiez un store réel ou un store fictif, vos tests sont fonction de vos préférences. Les deux sont corrects. L'important est que vous testiez vos composants.

## Tester un espace de nom d'Action (ou de Mutation)

Le troisième et dernier exemple montre une autre façon de vérifier qu'une action a été envoyée (ou une mutation actée) avec bons arguments. Cette méthode combine les deux techniques décrite ci-dessus - un vrai magasin `Vuex` et une simulation d'une propagation d'une méthode.


```js
it("dispatch a namespaced action when button is clicked", async () => {
  const store = new Vuex.Store()
  store.dispatch = jest.fn()

  const wrapper = mount(ComponentWithButtons, {
    store, localVue
  })

  wrapper.find(".namespaced-dispatch").trigger("click")
  await wrapper.vm.$nextTick()

  expect(store.dispatch).toHaveBeenCalledWith(
    'namespaced/very/deeply/testAction',
    { msg: "Test Namespaced Dispatch" }
  )
})
```
Nous commençons par créer un magasin Vuex, avec le(s) module(s) qui nous intéresse(nt). Je déclare le modue `namespacedModule` dans notre test, mais dans une application réelle, vous importerez juste les modules de votre composant dépend. Nous remplaçons alors la méthode `dispatch` par une simulation `jest.fn` et nous affirmons contre cela.

## Conclusion

Dans cette section nous avons couvert :

1. L'utilisation de Vuex avec un `localVue` et une simulation d'une mutation.
2. La simulation de l'API de Vuex (`dispatch ` et `commit`)
3. L'utilisation d'un véritable magasin Vuex avec une simulation d'une fonction de propagation.

Le code source du test décrit sur cette page peut être trouvé [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/ComponentWithButtons.spec.js).
