:::tip Ce livre est écrit pour Vue.js 2 et Vue Test Utils v1.
Vous trouverez la version Vue.js 3 [ici](/v3/fr).
:::

## Tester Vuex dans les composants

Le code source du test décrit sur cette page peut être trouvé [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/ComponentWithVuex.spec.js).

## Utiliser `createLocalVue` pour tester `$store.state`

Dans une Application Vue normale, nous installons Vuex en utilisant `Vue.use(Vuex)`, et ensuite nous passons un nouveau store de Vuex à l'application. Si nous faisons la même chose à un test unitaire, cependant, tous les tests unitaires recevront le store de Vuex - même les tests qui n'utilisent pas le store. `vue-test-utils` fournit une méthode `createLocalVue`, qui fournit une instance `Vue` temporaire à utiliser test par test. Voyons comment l'utiliser. Tout d'abord, un simple composant `<ComponentWithGetters>` qui rend un nom d'utilisateur dans l'état de base du store.

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
Nous pouvons utiliser `createLocalVue` pour créer une instance temporaire de Vue, et installer Vuex. Ensuite nous passons simplement un nouveau `store` dans les options de montage du composant. Le test complet ressemble à ceci :

```js
import Vuex from "vuex"
import { mount, createLocalVue } from "@vue/test-utils"
import ComponentWithVuex from "@/components/ComponentWithVuex.vue"

const localVue = createLocalVue()
localVue.use(Vuex)

const store = new Vuex.Store({
  state: {
    username: "alice"
  }
})

describe("ComponentWithVuex", () => {
  it("renders a username using a real Vuex store", () => {
    const wrapper = mount(ComponentWithVuex, {
      store,
      localVue
    })

    expect(wrapper.find(".username").text()).toBe("alice")
  })
})
```
Les tests passent. Créer un nouveau `locaVue` introduit quelques expressions standards, et le test est un peu long. Si vous avez beaucoup de composants qui utilisent le store de Vuex, une alternative est d'utiliser l'option de montage `mock` et de simplement simuler un store.

## Utiliser un faux store

Utiliser l'option de montage `mock`, vous pouvez simuler l'objet global `$store`. Cela signifie que vous n'avez pas besoin d'utiliser `createLocalVue`, ou de créer un nouveau store de Vuex. En utilisant cette technique, le test ci-dessus peut être réécrit comme ceci :

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
Personnellement, je préfère cette approche. Toutes les données nécessaires sont déclarées dans le test, et c'est un peu plus compact. Les deux techniques sont utiles, et aucune n'est meilleur ou pire que l'autre.

## Tester les `getters`

Grâce à ces techniques, les `getters` sont facilement testés. Tout d'abord, un composant à tester :

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

Nous voulons affirmer que le composant rend correctement le `fullname` de l'utilisateur. Pour ce test, nous ne soucions pas d'où le `fullname` provient, seulement que le composant rend correctement.

Tout d'abord, en utilisant un vrai store de Vuex et un `createLocalVue`, le test ressemble à ceci :

```js
const localVue = createLocalVue()
localVue.use(Vuex)

const store = new Vuex.Store({
  state: {
    firstName: "Alice",
    lastName: "Doe"
  },

  getters: {
    fullname: (state) => state.firstName + " " + state.lastName
  }
})

it("renders a username using a real Vuex getter", () => {
  const wrapper = mount(ComponentWithGetters, { store, localVue })

  expect(wrapper.find(".fullname").text()).toBe("Alice Doe")
})
```
Le test est très compact - seulement deux lignes de code. Cependant, il y a beaucoup de configuration à faire - nous sommes en train de reconstruire le store de Vuex. Une alternative est d'importer le vrai store de Vuex, avec un réel getter. Cela introduit une autre dépendance au test, et lors d'un développement d'un large système, il est possible que le store de Vuex soit développé par un autre développeur, et qu'il ne soit pas encore implémenté.

Voyons comment nous pouvons écrire le test en utilisant l'option de montage de `mock` :

```js
it("renders a username using computed mounting options", () => {
  const wrapper = mount(ComponentWithGetters, {
    mocks: {
      $store: {
        getters: {
          fullname: "Alice Doe"
        }
      }
    }
  })

  expect(wrapper.find(".fullname").text()).toBe("Alice Doe")
})
```
Maintenant, toutes les données sont dans le test. Super ! Je préfère beaucoup cette solution, car le test est entièrement contenu, et toutes les connaissances requises pour comprendre ce que le composant doit faire sont contenues dans ce test.

Nous pouvons cependant rendre le test encore plus concis, en utilisant l'option de montage `computed`.

## Simuler les getters en utilisant `computed`

Les getters sont généralement compris dans les propriétés `computed`. N'oubliez pas que ce test vise à s'assurer que le composant se comporte correctement compte tenu de l'état actuel du store. Nous ne testons pas l'implémentation de `fullname`, ou de voir si les `getters` fonctionnent. Cela signifie que nous pouvons simplement remplacer le store réel, ou un store fictif, en utilisant l'option de montage `computed`. Le test peut être réécrit comme ceci :

```js
it("renders a username using computed mounting options", () => {
  const wrapper = mount(ComponentWithGetters, {
    computed: {
      fullname: () => "Alice Doe"
    }
  })

  expect(wrapper.find(".fullname").text()).toBe("Alice Doe")
})
```
C'est plus concis que les deux précédents tests, et exprime toujours l'intention du composant.

## Les aides `mapState` et `mapGetters`

Les techniques ci-dessus fonctionnent toutes en conjonction avec les aides de `mapState`et de `mapGetters`. Nous pouvons mettre à jour `ComponentWithGetters` comme suit :
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

Ce guide nous parle :
This guide discussed:

- using `createLocalVue` and a real Vuex store to test `$store.state` and `getters`
- L'utilisation de `createLocalVue` et d'un vrai store de Vuex pour tester `$store.state` et les `getters`.
- L'utilisation de l'option de montage `mocks` pour simuler un `$store.state` et les `getters`.
- L'utilisation de l'option de montage `computed` pour définir la valeur souhaitée d'un getter de Vuex.

Les techniques permettant la mise en œuvre  des getters de Vuex de manière isolée peuvent être trouvé [ici](https://lmiller1990.github.io/vue-testing-handbook/vuex-getters.html).

Le code source du test décrit sur cette page peut être trouvé [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/ComponentWithVuex.spec.js).
