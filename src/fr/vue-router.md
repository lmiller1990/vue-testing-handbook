:::tip Ce livre est écrit pour Vue.js 2 et Vue Test Utils v1.
Vous trouverez la version Vue.js 3 [ici](/v3/fr).
:::

## Vue Router

Étant donné qu'un routeur comporte généralement plusieurs composants fonctionnant ensemble, les tests de routage ont souvent lieu plus haut dans la [pyramide de tests](https://medium.freecodecamp.org/the-front-end-test-pyramid-rethink-your-testing-3b343c2bca51), au niveau des tests de  e2e/intégration. Cependant, avoir des tests unitaires autour de votre routeur peut être bénéfique.

Tout comme les sections précédentes, il existe deux façons de tester les composants qui interagissent avec un routeur :

1. En utilisant une instance réelle de routeur.
2. En simulant des objets globaux de `$route` et de `$router`.

Comme la plupart des applications Vue utilisent le routeur Vue officiel, ce guide se concentrera sur ce point.

Le code source du test décrit sur cette page peut être trouvé [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/App.spec.js) et [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/NestedRoute.spec.js).

## La création de composants

Nous allons construire un simple `<App>` qui a une route `/nested-child`. Quand nous nous rendons sur `nested_child` on nous rend un composant `<NestedRoute>`. Créez un fichier `App.vue` et insérez le composant minimal suivant :

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

## La création de Router et de Routes

Maintenant il nous faut des routes à tester. Commençons par les routes :

```js
import NestedRoute from "@/components/NestedRoute.vue"

export default [
  { path: "/nested-route", component: NestedRoute }
]
```
Dans une application réelle, vous devez normalement créez un fichier `router.js`, importer les routes que vous avez faites et écrire quelque chose comme ceci :


```js
import Vue from "vue"
import VueRouter from "vue-router"
import routes from "./routes.js"

Vue.use(VueRouter)

export default new VueRouter({ routes })
```
Comme nous ne voulons pas polluer le namespace par des appels `Vue.use()`dans nos tests, nous allons créer le router pour notre test. Cela nous permettra d'avoir un contrôle lus fin sur l'état de l'application pendant les tests unitaires.

## L'écriture du Test

Examinons le code, puis nous parlerons de ce qui se passe. Nous testons `App.vue`, donc dans `App.spec.js`ajoutez ce qui suit :

```js
import { shallowMount, mount, createLocalVue } from "@vue/test-utils"
import App from "@/App.vue"
import VueRouter from "vue-router"
import NestedRoute from "@/components/NestedRoute.vue"
import routes from "@/routes.js"

const localVue = createLocalVue()
localVue.use(VueRouter)

describe("App", () => {
  it("renders a child component via routing", async () => {
    const router = new VueRouter({ routes })
    const wrapper = mount(App, {
      localVue,
      router
    })

    router.push("/nested-route")
    await wrapper.vm.$nextTick()

    expect(wrapper.find(NestedRoute).exists()).toBe(true)
  })
})
```

* Notez que les tests sont indiqués comme `await` et appelez par `nextTick`. Regardez [ici](/simulating-user-input.html#writing-the-test) afin d'avoir plus de détails sur le pourquoi.

Comme d'habitude, nous commençons par importer les différents modules pour le test. Notamment, nous importons les routes réelles que nous utiliserons pour l'application. C'est une bonne façon - si le routage réel échoue, les tests unitaires devraient échouer, ce qui nous permet de régler le problème avant de déployer l'application.

Nous pouvons utiliser le même `localVue`pour tout le test de l'`App.vue`, donc nous allons le déclarer en dehors du premier bloc `describe`. Cependant, comme nous souhaitons avoir des différents tests sur différentes routes, la solution n'est pas aussi simple que de définir le router à l'intérieur du bloc `it`.

Même si vous placez le router à l'intérieur du clic `it`, il pointera toujours la route précédente. Vous pouvez essayer l’exemple ci-dessous :

```js
import { shallowMount, mount, createLocalVue } from "@vue/test-utils"
import App from "@/App.vue"
import VueRouter from "vue-router"
import NestedRoute from "@/components/NestedRoute.vue"
import routes from "@/routes.js"

const localVue = createLocalVue()
localVue.use(VueRouter)

describe("App", () => {
  it("renders a child component via routing", async () => {
    const router = new VueRouter({ routes })
    const wrapper = mount(App, {
      localVue,
      router
    })

    router.push("/nested-route")
    await wrapper.vm.$nextTick()

    expect(wrapper.find(NestedRoute).exists()).toBe(true)
  });

  it("should have a different route that /nested-route", async () => {
    const router = new VueRouter({ routes })
    const wrapper = mount(App, {
      localVue,
      router
    })
    // This test will fail because we are still on the /nested-route
    expect(wrapper.find(NestedRoute).exists()).toBe(false)
    console.log(router.currentRoute)
  })
})
```
La solution est de définir le mode **history** ou **abstract**.
```vue
const router = new VueRouter({ routes, mode: 'abstract' });
```
Maintenant la route actuelle sera la route home.
```json
 {
      name: null,
      meta: {},
      path: '/',
      hash: '',
      query: {},
      params: {},
      fullPath: '/',
      matched: []
    }
```
Un autre point notable qui est différent des autres articles de ce livre est de l'utilisation de `mount` à la place de `shallowMount`. Si nous utilisons `shallowMount`, `<routee-link>`sera tronqué, quel que soit le chemin actuel, un composant tronqué inutile sera rendu.

## La solution pour les grandes arborescences en utilisant `mount`
L'utilisation de `mount` est bonne dans certains cas, ais parfois elle n'est pas idéale. Par exemple, si vous rendez l'intégralité du composant `<App>`, il y a de fortes chances que l'arborescence soit très étendu, avec beaucoup de composants qui ont leurs propres composants enfants, etc. Beaucoup des composants enfants déclenchent divers cycles de vie des hooks, en faisant des requêtes API et autres.

Si vous utilisez Jest, son puissant système de simulations fournit une solution élégante à ce problème. Vous pouvez simplement simuler des composants enfants, dans notre cas `<NestedRoute>`. La simulation suivante peut être utilisé et le test suivant sera toujours réussi :

```js
jest.mock("@/components/NestedRoute.vue", () => ({
  name: "NestedRoute",
  render: h => h("div")
}))
```

## L'utilisation d'un faux router

Des fois un réel router n'est pas nécessaire. Modifiez `<NesetedRoute>` pour qu'il montre le nom d'utilisateur qui est dans la chaîne de requête de la route. Cette fois, nous utiliserons le TDD pour implémenter la fonctionnalité. Voici un test de base qui rend simplement le composant et fait une affirmation :

```js
import { shallowMount } from "@vue/test-utils"
import NestedRoute from "@/components/NestedRoute.vue"
import routes from "@/routes.js"

describe("NestedRoute", () => {
  it("renders a username from query string", () => {
    const username = "alice"
    const wrapper = shallowMount(NestedRoute)

    expect(wrapper.find(".username").text()).toBe(username)
  })
})
```
Nous n'avons pas encore `<div class="username">`, donc le test échoue :

```
FAIL  tests/unit/NestedRoute.spec.js
  NestedRoute
    ✕ renders a username from query string (25ms)

  ● NestedRoute › renders a username from query string

    [vue-test-utils]: find did not return .username, cannot call text() on empty Wrapper
```

Modifiez `<NestedRoute>`:

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
Maintenant le test échoue avec comme message :

```
FAIL  tests/unit/NestedRoute.spec.js
  NestedRoute
    ✕ renders a username from query string (17ms)

  ● NestedRoute › renders a username from query string

    TypeError: Cannot read property 'params' of undefined
```

C'est parce que `$route` n'existe pas encore. Nous pouvons utiliser un vrai router, mais dans ce cas cela sera plus facile d'utiliser l'option de montage `mocks` :

```js
it("renders a username from query string", () => {
  const username = "alice"
  const wrapper = shallowMount(NestedRoute, {
    mocks: {
      $route: {
        params: { username }
      }
    }
  })

  expect(wrapper.find(".username").text()).toBe(username)
})
```
Maintenant le test passes. Dans ce cas, nous n'avons pas de navigation ou rien qui repose sur l'implémentation du router, donc l'utilisation de `mock` est bonne. Nous ne nous soucions pas vraiment de la façon dont l'`username` se trouve dans la chaîne de requête de la route mais seulement de sa présence.

Souvent le serveur va fournir le routage, par opposition au routage côté client avec Vue Router. Sans de tels cas, l'utilisation de `mock` pour définir la chaîne de requête dans un test est une bonne alternative à l'utilisation d'une réelle instance de Vue Router.

## Les Stratégies pour tester les Hooks de Router

Vue Router fournit plusieurs types de hooks de routeur, ce référer ["navigation guards"](https://router.vuejs.org/guide/advanced/navigation-guards.html). En voici deux exemples:

1. Les intercepteurs globaux (`router.beforeEach`). Déclarés sur l'instance du routeur.
2. Dans les composants d'interception, comme `beforeRouteEnter`. Déclaré dans les composants.

S'assurer que ceux-ci se comportent correctement est généralement une tâche pour un test d'intégration, puisque vous devez faire naviguer un utilisateur d'une route à l'autre. Cependant vous pouvez également utiliser des tests unitaires pour vois si les fonctions appelées dans les intercepteurs de navigation fonction correctement et de récupérer facilement un retour sur des bugs potentiels. Voici quelques stratégies pour découpler la logique des intercepteurs de navigation et écrire des tests unitaires autour d'eux.

## Les Intercepteurs Globaux

Supposons que vous ayez une fonction `bustCache` qui doit être appelez sur chaque route qui contient le méta-champ `shouldBustCache`. Vos routes devraient ressembler à ceci :

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
En utilisant le méta-champ `shouldBustCache`, vous voulez invalidez le cache actuel afin de vous assurer que l'utilisateur n'obtienne pas de données périmées. Une implémentation devrait ressembler à ceci :

```js
import Vue from "vue"
import VueRouter from "vue-router"
import routes from "./routes.js"
import { bustCache } from "./bust-cache.js"

Vue.use(VueRouter)

const router = new VueRouter({ routes })

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.shouldBustCache)) {
    bustCache()
  }
  next()
})

export default router
```
Dans votre test unitaire, vous __pourriez__ importez l'instance de la routeur et tenter d'appeler `beforeEach` en tapant `router.beforeHooks[0]()`. Cela provoquera une erreur sur `next` - puisque vous n'avez pas passé les bons arguments. Au lieu de cela, une stratégie consiste à découper et exporter indépendamment le hook de navigation `beforeEach` avant de le coupler au router. Et pourquoi pas :
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
Maintenant écrire un test est plus facile, même s'il est un peu long :

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
Le point intéressant est que nous avons simuler un module entier en utilisant `jest.mock`,  et que nous réinitialisons la simulation en utilisant le hook `afterEach`. En exportant le `beforeEach` comme une fonction Javascript découpée et régulière, il devient trivial de le tester.

Pour être sûr que le hook appel réellement `bustCache` et d'afficher les données	les plus récentes, on peut utiliser un outil de test e2e comme [Cypress.io](https://www.cypress.io/), qui est fourni avec les applications échafauder avec vue-cli.

## Interception par composant

Les interceptions par composant sont aussi faciles à tester, une fois que vous les voyez comme des fonctions Javascript découplées et régulières. Supposons que vous ajoutez un hook `beforeRouteLeave` à `<NestedRoute>` :

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

Nous pouvons le tester exactement de la même manière que l'intercepteur global :

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
Bien que ce style de test unitaire puisse être utile pour avoir un retour d'information immédiat pendant le développement, puisque les routeurs et les hooks de navigation interagissent souvent avec plusieurs composants pour obtenir un certain effet, vous devriez aussi disposer de tests d'intégration pour vous assurer que tout fonctionne correctement.

## Conclusion

Ce guide couvre :
- Le test conditionnel de composant rendu par Vue Router.
- La simulation de composant Vue utilisant `jest.mock` et `localVue`.
- Le découplage de l'interception de la navigation global du routeur en le testant indépendamment.
- L'utilisation de `jest.mock`pour simuler un module.

Le code source du test décrit sur cette page peut être trouvé [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/App.spec.js) et [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/NestedRoute.spec.js).
