:::tip Ce livre est écrit pour Vue.js 3 et Vue Test Utils v2.
Vous trouverez la version Vue.js 2 [ici](/fr).
:::

## Vue Router

Puisqu'un routeur implique généralement plusieurs composants fonctionnant ensemble, les tests de routage ont souvent lieu plus haut dans la [pyramide de test](https://medium.freecodecamp.org/the-front-end-test-pyramid-rethink-your-testing-3b343c2bca51), jusqu'au niveau des tests e2e/intégration. Cependant, avoir quelques tests unitaires autour de votre routage peut être bénéfique également.

Tout comme les sections précédentes, il existe deux façons de tester les composants qui interagissent avec un routeur :

1. Utiliser une instance réelle de routeur
2. En simulant les objets globaux `$route` et `$router`.

Comme la plupart des applications Vue utilisent le routeur officiel de Vue, ce guide se concentrera sur celui-ci.

Le code source des tests décrits sur cette page se trouve [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app-vue-3/tests/unit/App.spec.js) et [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app-vue-3/tests/unit/NestedRoute.spec.js).

## Créer les composants

Nous allons construire une simple `<App>`, qui a une route `/nested-child`. Visiter `/nested-child` rend un composant `<NestedRoute>`. Créez un fichier `App.vue`, et insérez le composant minimal suivant :

```vue
<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>

export default {
  name: 'app'
}
</script>
```

`<NestedRoute>` est tout aussi minimal :

```vue
<template>
  <div>Nested Route</div>
</template>

<script>
export default {
  name: "NestedRoute"
}
</script>
```

## Créer le routeur et les routes

Maintenant nous avons besoin de routes à tester. Commençons par les routes :

```js
import NestedRoute from "@/components/NestedRoute.vue"

export default [
  { path: "/nested-route", component: NestedRoute }
]
```

Dans une application réelle, vous devriez normalement créer un fichier `router.js` et importer les routes que nous avons faites, et écrire quelque chose comme ceci :

```js
import { createRouter, createMemoryHistory } from "vue-router"
import { createApp } from "vue"
import routes from "./routes.js"
import App from './App.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes
})
app.use(router)
app.mount("#app")
```

Comme avec Vuex, nous allons créer le routeur sur une base de test par test. Cela nous permettra d'avoir un contrôle plus fin sur l'état de l'application pendant les tests unitaires.

## Écrire le test

Regardons un peu de code, puis parlons de ce qui se passe. Nous testons `App.vue`, donc dans `App.spec.js` ajoutez ce qui suit :

```js
import { mount } from "@vue/test-utils"
import App from "../../src/App.vue"
import { createRouter, createMemoryHistory } from "vue-router"
import NestedRoute from "../../src/components/NestedRoute.vue"
import routes from "../../src/routes.js"

describe("App", () => {
  it("renders a child component via routing", async () => {
    const router = createRouter({ 
      history: createMemoryHistory(),
      routes 
    })
    router.push("/nested-route")
    await router.isReady()
    const wrapper = mount(App, { 
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.findComponent(NestedRoute).exists()).toBe(true)
  })
})
```

* Remarquez que les tests sont marqués `await` et appellent `nextTick`. Voir [ici](/simulating-user-input.html#writing-the-test) pour plus de détails sur le pourquoi.

Comme d'habitude, nous commençons par importer les différents modules du test. Notamment, nous importons les routes réelles que nous utiliserons pour l'application. C'est idéal d'une certaine manière - si le routage réel se casse, les tests unitaires devraient échouer, ce qui nous permettra de corriger le problème avant de déployer l'application.

Un autre point intéressant est que nous faisons ce qui suit avant de monter le composant :

```js
router.push("/nested-route")
await router.isReady()
```

Vue Router 4 (celui qui fonctionne avec Vue 3) a un routage asynchrone. Cela signifie que nous devons nous assurer que le routeur a terminé le routage initial avant de monter le composant. Ceci est facilement accompli avec `await router.isReady()`.

Enfin, notez que nous utilisons `mount`. Si nous utilisons `shallowMount`, `<router-link>` sera stubé, indépendamment de la route actuelle, un composant stub inutile sera rendu.

## Solution de rechange pour les grands arbres de rendu utilisant `mount`.

Utiliser `mount` est bien dans certains cas, mais parfois ce n'est pas idéal. Par exemple, si vous effectuez le rendu de l'ensemble de votre composant `<App>`, il y a de fortes chances que l'arbre de rendu soit grand, contenant de nombreux composants avec leurs propres composants enfants et ainsi de suite. Un grand nombre de composants enfants déclenchera divers crochets de cycle de vie, faisant des demandes d'API et ainsi de suite.

Si vous utilisez Jest, son puissant système de simulation offre une solution élégante à ce problème. Vous pouvez simplement simuler les composants enfants, dans ce cas `<NestedRoute>`. L'objet fantaisie suivant peut être utilisé et le test ci-dessus passera toujours :

```js
jest.mock("@/components/NestedRoute.vue", () => ({
  name: "NestedRoute",
  template: "<div />"
}))
```

## Utilisation d'un routeur fictif

Parfois un vrai routeur n'est pas nécessaire. Mettons à jour `<NestedRoute>` pour montrer un nom d'utilisateur basé sur la chaîne de requête du chemin courant. Cette fois-ci, nous allons utiliser TDD pour implémenter cette fonctionnalité. Voici un test de base qui rend simplement le composant et fait une affirmation :

```js
import { mount } from "@vue/test-utils"
import NestedRoute from "@/components/NestedRoute.vue"
import routes from "@/routes.js"

describe("NestedRoute", () => {
  it("renders a username from query string", () => {
    const username = "alice"
    const wrapper = mount(NestedRoute)

    expect(wrapper.find(".username").text()).toBe(username)
  })
})
```

Nous n'avons pas encore de `<div class="username">`, donc l'exécution du test nous donne :

```
FAIL  tests/unit/NestedRoute.spec.js
  NestedRoute
    ✕ renders a username from query string (25ms)

  ● NestedRoute › renders a username from query string

    [vue-test-utils]: find did not return .username, cannot call text() on empty Wrapper
``` 

Mise à jour de `<NestedRoute>` :

```vue
<template>
  <div>
    Nested Route
    <div class="username">
      {{ $route.params.username }}
    </div>
  </div>
</template>
```

Maintenant le test échoue avec :

```
FAIL  tests/unit/NestedRoute.spec.js
  NestedRoute
    ✕ renders a username from query string (17ms)

  ● NestedRoute › renders a username from query string

    TypeError: Cannot read property 'params' of undefined
```

C'est parce que `$route` n'existe pas. Nous pourrions utiliser un vrai routeur, mais dans ce cas, il est plus facile d'utiliser l'option de montage `mocks` :

```js
it("renders a username from query string", () => {
  const username = "alice"
  const wrapper = mount(NestedRoute, {
    global: {
      mocks: {
        $route: {
          params: { username }
        }
      }
    }
  })

  expect(wrapper.find(".username").text()).toBe(username)
})
```

Maintenant le test passe. Dans ce cas, nous ne faisons pas de navigation ou quoi que ce soit qui dépende de l'implémentation du routeur, donc utiliser `mocks` est bon. Nous ne nous soucions pas vraiment de savoir comment `username` se retrouve dans la chaîne de requête, seulement qu'il est présent. 

Parfois, le serveur va gérer certaines parties du routage, par opposition au routage côté client avec Vue Router. Dans de tels cas, l'utilisation de `mocks` pour définir la chaîne de requête dans un test est une bonne alternative à l'utilisation d'une instance réelle de Vue Router.

## Les stratégies pour tester les crochets de routeur

Vue Router fournit plusieurs types de crochets de routeur, appelés ["navigation guards"](https://router.vuejs.org/guide/advanced/navigation-guards.html). Deux de ces exemples sont :

1. Les gardes globales (`router.beforeEach`). Déclarées sur l'instance du routeur.
2. Les gardes dans les composants, comme `beforeRouteEnter`. Déclarées dans les composants.

S'assurer que ces éléments se comportent correctement est généralement un travail pour un test d'intégration, puisque vous avez besoin qu'un utilisateur navigue d'une route à une autre. Cependant, vous pouvez également utiliser des tests unitaires pour vérifier si les fonctions appelées dans les gardes de navigation fonctionnent correctement et obtenir un retour plus rapide sur les bogues potentiels. Voici quelques stratégies pour découpler la logique des gardes de navigation et écrire des tests unitaires autour d'elles.

## Gardes globaux

Disons que vous avez une fonction `bustCache` qui doit être appelée sur chaque route qui contient le champ méta `shouldBustCache`. Vos routes pourraient ressembler à ceci :

```js
import NestedRoute from "@/components/NestedRoute.vue"

export default [
  {
    path: "/nested-route",
    component: NestedRoute,
    meta: {
      shouldBustCache: true
    }
  }
]
```

En utilisant le champ méta `shouldBustCache`, vous voulez invalider le cache actuel pour vous assurer que l'utilisateur n'obtienne pas de données périmées. Une implémentation pourrait ressembler à ceci :

```js
import Vue from "vue"
import { createRouter, createMemoryHistory } from "vue-router"
import routes from "./routes.js"
import { bustCache } from "./bust-cache.js"

const router = createRouter({ 
  history: createMemoryHistory(),
  routes 
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.shouldBustCache)) {
    bustCache()
  }
  next()
})

export default router
```

Dans votre test unitaire, vous __pourriez__ importer l'instance du routeur, et essayer d'appeler `beforeEach` en tapant `router.beforeHooks[0]()`. Ceci lancera une erreur sur `next` - puisque vous n'avez pas passé les bons arguments. Au lieu de cela, une stratégie consiste à découpler et exporter indépendamment le hook de navigation `beforeEach`, avant de le coupler au routeur. Pourquoi pas ?

```js
export function beforeEach(to, from, next) {
  if (to.matched.some(record => record.meta.shouldBustCache)) {
    bustCache()
  }
  next()
}

router.beforeEach((to, from, next) => beforeEach(to, from, next))

export default router
```

Maintenant, écrire un test est facile, bien qu'un peu long :

```js
import { beforeEach } from "@/router.js"
import mockModule from "@/bust-cache.js"

jest.mock("@/bust-cache.js", () => ({ bustCache: jest.fn() }))

describe("beforeEach", () => {
  afterEach(() => {
    mockModule.bustCache.mockClear()
  })

  it("busts the cache when going to /user", () => {
    const to = {
      matched: [{ meta: { shouldBustCache: true } }]
    }
    const next = jest.fn()

    beforeEach(to, undefined, next)

    expect(mockModule.bustCache).toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  it("does not bust the cache when going to /user", () => {
    const to = {
      matched: [{ meta: { shouldBustCache: false } }]
    }
    const next = jest.fn()

    beforeEach(to, undefined, next)

    expect(mockModule.bustCache).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })
})
```

Le principal point d'intérêt est que nous simulons le module entier en utilisant `jest.mock`, et réinitialisons le simulateur en utilisant le hook `afterEach`. En exportant le `beforeEach` comme une fonction JavaScript régulière et découplée, il devient trivial de le tester. 

Pour s'assurer que le hook appelle effectivement `bustCache` et affiche les données les plus récentes, on peut utiliser un outil de test e2e comme [Cypress.io](https://www.cypress.io/), qui est livré avec des applications échafaudées avec vue-cli.

## Gardes de composants

Les gardiens de composants sont également faciles à tester, une fois que vous les voyez comme des fonctions JavaScript ordinaires et découplées. Disons que nous avons ajouté un hook `beforeRouteLeave` à `<NestedRoute>` :

```vue
<script>
import { bustCache } from "@/bust-cache.js"
export default {
  name: "NestedRoute",

  beforeRouteLeave(to, from, next) {
    bustCache()
    next()
  }
}
</script>
```

Nous pouvons tester cela exactement de la même manière que pour la garde globale :

```js
// ...
import NestedRoute from "@/components/NestedRoute.vue"
import mockModule from "@/bust-cache.js"

jest.mock("@/bust-cache.js", () => ({ bustCache: jest.fn() }))

it("calls bustCache and next when leaving the route", async () => {
  const wrapper = shallowMount(NestedRoute);
  const next = jest.fn()
  NestedRoute.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next)
  await wrapper.vm.$nextTick()


  expect(mockModule.bustCache).toHaveBeenCalled()
  expect(next).toHaveBeenCalled()
})
```

Bien que ce style de test unitaire puisse être utile pour un retour d'information immédiat pendant le développement, étant donné que les routeurs et les crochets de navigation interagissent souvent avec plusieurs composants pour obtenir un certain effet, vous devriez également avoir des tests d'intégration pour vous assurer que tout fonctionne comme prévu.

## Conclusion

Ce guide a couvert :

- le test des composants rendus de manière conditionnelle par Vue Router
- l'adaptation des composants Vue en utilisant `jest.mock` et `localVue`.
- découpler les gardes de navigation globale du routeur et tester l'indépendant
- utiliser `jest.mock` pour simuler un module.

Le code source du test décrit sur cette page est disponible [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app-vue-3/tests/unit/App.spec.js) et [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app-vue-3/tests/unit/NestedRoute.spec.js).
