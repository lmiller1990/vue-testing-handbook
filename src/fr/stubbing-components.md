:::tip Ce livre est écrit pour Vue.js 2 et Vue Test Utils v1.
Vous trouverez la version Vue.js 3 [ici](/v3/fr).
:::

## Les composants stub

Vous pouvez trouver le test décrit sur cette page [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/ParentWithAPICallChild.spec.js).

## Pourquoi un stub ?

Lors de l'écriture de tests unitaires, nous voulons souvent _stuber_ des parties du code qui ne nous intéressent pas. Un stub est simplement un morceau de code qui en remplace un autre. Disons que vous écrivez un test pour un composant `<UserContainer>`. Il ressemble à ceci :

```html
<UserContainer>
  <UsersDisplay />
</UserContainer>
```

`<UsersDisplay>` a une méthode de cycle de vie `créée` comme celle-ci :

```js
created() {
  axios.get("/users")
}
```

Nous voulons écrire un test qui affirme que `<UsersDisplay>` est rendu.

`axios` fait une demande ajax à un service extérieur dans le crochet "créé". Cela signifie que lorsque vous faites un `mount(UserContainer)`, `<UsersDisplay>` est également monté, et `created` lance une requête ajax. Comme il s'agit d'un test unitaire, nous nous intéressons seulement à savoir si `<UserContainer>` rend correctement `<UsersDisplay>` - vérifier que la requête ajax est déclenchée avec le bon point de terminaison, etc, est la responsabilité de `<UsersDisplay>`, qui doit être testé dans le fichier de test `<UsersDisplay>`.

Une façon d'empêcher le `<UsersDisplay>` de lancer la requête ajax est de _stubber_ le composant. Écrivons nos propres composants et testons, pour mieux comprendre les différentes façons et les avantages de l'utilisation des stubs.

## Création des composantes

Cet exemple utilisera deux composantes. Le premier est `ParentWithAPICallChild`, qui rend simplement un autre composant :

```html
<template>
  <ComponentWithAsyncCall />
</template>

<script>
import ComponentWithAsyncCall from "./ComponentWithAsyncCall.vue"

export default {
  name: "ParentWithAPICallChild",

  components: {
    ComponentWithAsyncCall
  }
}
</script>
```

`<ParentWithAPICallChild>` est un composant simple. Sa seule responsabilité est de rendre `<ComponentWithAsyncCall>`. `<ComponentWithAsyncCall>`, comme son nom l'indique, effectue un appel ajax en utilisant le client http `axios` :

```html
<template>
  <div></div>
</template>

<script>
import axios from "axios"

export default {
  name: "ComponentWithAsyncCall",

  created() {
    this.makeApiCall()
  },

  methods: {
    async makeApiCall() {
      console.log("Making api call")
      await axios.get("https://jsonplaceholder.typicode.com/posts/1")
    }
  }
}
</script>
```

`<ComponentWithAsyncCall>` appelle `makeApiCall` dans le crochet de cycle de vie `créé`.

## Faire un test en utilisant `mount`

Commençons par écrire un test pour vérifier que `<ComponentWithAsyncCall>` est rendu :

```js
import { shallowMount, mount } from '@vue/test-utils'
import ParentWithAPICallChild from '@/components/ParentWithAPICallChild.vue'
import ComponentWithAsyncCall from '@/components/ComponentWithAsyncCall.vue'

describe('ParentWithAPICallChild.vue', () => {
  it('renders with mount and does initialize API call', () => {
    const wrapper = mount(ParentWithAPICallChild)

    expect(wrapper.find(ComponentWithAsyncCall).exists()).toBe(true)
  })
})
```

Exécution du fichier avec `yarn test:unit` :

```
PASS  tests/unit/ParentWithAPICallChild.spec.js

console.log src/components/ComponentWithAsyncCall.vue:17
  Making api call
```

Le test est réussi - super ! Cependant, nous pouvons faire mieux. Remarquez le fichier `console.log` dans la sortie du test - cela vient de la méthode `makeApiCall`. Idéalement, nous ne voulons pas faire d'appels à des services externes dans nos tests unitaires, surtout lorsqu'ils proviennent d'un composant qui n'est pas l'objet principal du test en cours. Nous pouvons utiliser l'option de montage des "tubes", décrite dans les documents "Vue-test-utils" [ici](https://vue-test-utils.vuejs.org/api/options.html#stubs).

## Using `stubs` to stub `<ComponentWithAsyncCall>`

Mettons à jour le test, cette fois-ci avec le stub de `<ComponentWithAsyncCall>` :

```js
it('renders with mount and does initialize API call', () => {
  const wrapper = mount(ParentWithAPICallChild, {
    stubs: {
      ComponentWithAsyncCall: true
    }
  })

  expect(wrapper.find(ComponentWithAsyncCall).exists()).toBe(true)
})
```

Le test est toujours réussi quand on lance "yarn test:unit", mais le fichier "console.log" n'est pas visible. C'est parce que passer `[component] : true` à `stubs` a remplacé le composant original par un _stub_. L'interface externe est toujours la même (nous pouvons toujours la sélectionner en utilisant `find`, puisque la propriété `name`, qui est utilisée en interne par `find`, est toujours la même). Les méthodes internes, telles que `makeApiCall`, sont remplacées par des méthodes factices qui ne font rien - elles sont "écrasées".

Vous pouvez également spécifier le balisage à utiliser pour le stubbing, si vous le souhaitez :

```js
const wrapper = mount(ParentWithAPICallChild, {
  stubs: {
    ComponentWithAsyncCall: "<div class='stub'></div>"
  }
})
```

## Automatically stubbing with `shallowMount`

Au lieu d'utiliser `mount` et de bloquer manuellement `<ComponentWithAsyncCall>`, nous pouvons simplement utiliser `shallowMount`, qui bloque automatiquement tous les autres composants par défaut. Le test avec `shallowMount` ressemble à ceci :

```js
it('renders with shallowMount and does not initialize API call', () => {
  const wrapper = shallowMount(ParentWithAPICallChild)

  expect(wrapper.find(ComponentWithAsyncCall).exists()).toBe(true)
})
```

L'exécution de `yarn test:unit` ne montre aucun `console.log`, et le test réussit. Le `shallowMount` est automatiquement barré `<ComponentWithAsyncCall>`. Le `shallowMount` est utile pour tester des composants qui ont beaucoup de composants enfants, qui pourraient avoir un comportement déclenché dans des crochets de cycle de vie tels que `created` ou `mounted`, etc. J'ai tendance à utiliser `shallowMount` par défaut, sauf si j'ai une bonne raison d'utiliser `mount`. Cela dépend de votre cas d'utilisation, et de ce que vous testez.

## Conclusion

- Les `stub` sont utiles pour déceler le comportement des enfants qui n'est pas lié à l'essai unitaire actuel
- La fonction `shallowMount` bloque les composants enfants par défaut
- vous pouvez passer `true` pour créer un stub par défaut, ou passer votre propre implémentation personnalisée

Vous pouvez trouver le test décrit sur cette page [ici].(https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/ParentWithAPICallChild.spec.js).
