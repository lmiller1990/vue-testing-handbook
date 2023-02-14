:::tip Ce livre est écrit pour Vue.js 3 et Vue Test Utils v2.
Vous trouverez la version Vue.js 2 [ici](/fr).
:::

## Test de Vuex dans les composants

Le code source du test décrit sur cette page se trouve [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app-vue-3/tests/unit/ComponentWithVuex.spec.js).

## Utilisation de `global.plugins` pour tester `$store.state`.

Dans une application Vue normale, nous installons Vuex en utilisant `app.use(store)`, qui installe un magasin Vuex disponible globalement dans l'application. Dans un test unitaire, nous pouvons faire exactement la même chose. Contrairement à une application Vue normale, nous ne voulons pas partager le même magasin Vuex pour chaque test - nous en voulons un nouveau pour chaque test.
Voyons comment nous pouvons le faire. Tout d'abord, un simple composant `<ComponentWithGetters>` qui rend un nom d'utilisateur dans l'état de base du magasin.

```html
<template>
  <div>
    <div class="username">
      {{ username }}
    </div>
  </div>
</template>

<script>
export default {
  name: "ComponentWithVuex",

  data() {
    return {
      username: this.$store.state.username
    }
  }
}
</script>
```

Nous pouvons utiliser `createStore` pour créer un nouveau magasin Vuex. Ensuite, nous passons le nouveau `store` dans les options de montage `global.plugins` du composant. Un test complet ressemble à ceci :

```js
import { createStore } from "vuex"
import { mount } from "@vue/test-utils"
import ComponentWithVuex from "../../src/components/ComponentWithVuex.vue"

const store = createStore({
  state() {
    return {
      username: "alice",
      firstName: "Alice",
      lastName: "Doe"
    }
  },

  getters: {
    fullname: (state) => state.firstName + " " + state.lastName
  }
})

describe("ComponentWithVuex", () => {
  it("renders a username using a real Vuex store", () => {
    const wrapper = mount(ComponentWithVuex, {
      global: {
        plugins: [store]
      }
    })

    expect(wrapper.find(".username").text()).toBe("alice")
  })
})
```

Les tests passent. La création d'un nouveau magasin Vuex à chaque test introduit une certaine quantité de code. Le code total requis est assez long. Si vous avez beaucoup de composants qui utilisent un magasin Vuex, une alternative est d'utiliser l'option de montage `global.mocks`, et de simplement simuler le magasin. 

## Utilisation d'un magasin factice (mock store)

En utilisant les options de montage `mocks`, vous pouvez simuler l'objet global `$store`. Cela signifie que vous n'avez pas besoin de créer un nouveau magasin Vuex. En utilisant cette technique, le test ci-dessus peut être réécrit comme ceci :

```js
it("renders a username using a mock store", () => {
  const wrapper = mount(ComponentWithVuex, {
    mocks: {
      $store: {
        state: { username: "alice" }
      }
    }
  })

  expect(wrapper.find(".username").text()).toBe("alice")
})
```

Je ne recommande pas l'un ou l'autre. Le premier test utilise un magasin Vuex réel, ce qui est plus proche de la façon dont votre application fonctionnera en production. Cela dit, il introduit un grand nombre d'éléments passe-partout et si vous avez un magasin Vuex très complexe, vous risquez de vous retrouver avec de très grandes méthodes d'aide pour créer le magasin, ce qui rendra vos tests difficiles à comprendre. 

La deuxième approche utilise un magasin factice. L'un des avantages de cette approche est que toutes les données nécessaires sont déclarées dans le test, ce qui le rend plus facile à comprendre, et il est un peu plus compact. En revanche, elle est moins susceptible de détecter les régressions dans votre magasin Vuex. Vous pourriez supprimer l'intégralité de votre magasin Vuex et ce test passerait quand même - ce qui n'est pas idéal.

Les deux techniques sont utiles, et aucune n'est meilleure ou pire que l'autre.

## Test de `getters`

En utilisant les techniques ci-dessus, les `getters` sont facilement testés. D'abord, un composant à tester :

```html
<template>
  <div class="fullname">
    {{ fullname }}
  </div>
</template>

<script>
export default {
  name: "ComponentWithGetters",

  computed: {
    fullname() {
      return this.$store.getters.fullname
    }
  }
}
</script>
```

Nous voulons affirmer que le composant rend correctement le `fullname` de l'utilisateur. Pour ce test, nous ne nous soucions pas d'où vient le `fullname`, juste que le composant le rende correctement.

D'abord, en utilisant un vrai magasin Vuex, le test ressemble à ceci :

```js
const store = createStore({
  state: {
    firstName: "Alice",
    lastName: "Doe"
  },

  getters: {
    fullname: (state) => state.firstName + " " + state.lastName
  }
})

it("renders a username using a real Vuex getter", () => {
  const wrapper = mount(ComponentWithGetters, {
    global: {
      plugins: [store]
    }
  })

  expect(wrapper.find(".fullname").text()).toBe("Alice Doe")
})
```

Le test est très compact - seulement deux lignes de code. Il y a beaucoup de configuration impliquée, cependant - nous sommes obligés d'utiliser un magasin Vuex. Notez que nous n'utilisons *pas* le magasin Vuex que notre application utiliserait, nous en avons créé un minimal avec les données de base nécessaires pour fournir le getter `fullname` que le composant attendait.

Une alternative est d'importer le magasin Vuex réel que vous utilisez dans votre application, qui inclut les getters réels. Cela introduit cependant une autre dépendance au test, et lors du développement d'un grand système, il est possible que le magasin Vuex soit développé par un autre programmeur, et n'ait pas encore été implémenté, mais il n'y a aucune raison pour que cela ne fonctionne pas.

Une alternative serait d'écrire le test en utilisant l'option de montage `global.mocks` :

```js
it("renders a username using computed mounting options", () => {
  const wrapper = mount(ComponentWithGetters, {
    global: {
      mocks: {
        $store: {
          getters: {
            fullname: "Alice Doe"
          }
        }
      }
    }
  })

  expect(wrapper.find(".fullname").text()).toBe("Alice Doe")
})
```

Maintenant, toutes les données requises sont contenues dans le test. Super ! J'aime ça. Le test est entièrement contenu, et toutes les connaissances nécessaires pour comprendre ce que le composant doit faire sont contenues dans le test.

## Les aides `mapState` et `mapGetters`.

Les techniques ci-dessus fonctionnent toutes en conjonction avec les aides `mapState` et `mapGetters` de Vuex. Nous pouvons mettre à jour `ComponentWithGetters` comme suit :

```js
import { mapGetters } from "vuex"

export default {
  name: "ComponentWithGetters",

  computed: {
    ...mapGetters([
      'fullname'
    ])
  }
}
```

Les tests passent toujours.

## Conclusion

Ce guide a abordé :

- l'utilisation de `createStore` pour créer un vrai magasin Vuex et l'installer avec `global.plugins`.
- Comment tester `$store.state` et `getters`.
- l'utilisation de l'option de montage `global.mocks` pour simuler `$store.state` et `getters`.

Les techniques permettant de tester l'implémentation des getters Vuex de manière isolée se trouvent dans [ce guide](https://lmiller1990.github.io/vue-testing-handbook/vuex-getters.html).

Le code source du test décrit sur cette page se trouve [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app-vue-3/tests/unit/ComponentWithVuex.spec.js).
