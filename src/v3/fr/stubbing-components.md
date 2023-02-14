:::tip Ce livre est écrit pour Vue.js 3 et Vue Test Utils v2.
Vous trouverez la version Vue.js 2 [ici](/fr).
:::

## Composants du stubbing

Vous pouvez trouver le test décrit sur cette page [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app-vue-3/tests/unit/ParentWithAPICallChild.spec.js).

## Pourquoi stub ?

Lors de l'écriture de tests unitaires, nous souhaitons souvent _stub_ des parties du code qui ne nous intéressent pas. Un stub est simplement un morceau de code qui se substitue à un autre. Disons que vous écrivez un test pour un composant `<UserContainer>`. Cela ressemble à ceci :

```html
<UserContainer>
  <UsersDisplay />
</UserContainer>
```

`<UsersDisplay>` a une méthode de cycle de vie `created` comme ceci :

```js
created() {
  axios.get("/users")
}
```

Nous voulons écrire un test qui affirme que `<UsersDisplay>` est rendu. 

`axios` fait une requête ajax vers un service externe dans le hook `created`. Cela signifie que lorsque vous faites `mount(UserContainer)`, `<UsersDisplay>` est également monté, et `created` initie une requête ajax. Comme il s'agit d'un test unitaire, nous sommes seulement intéressés à savoir si `<UserContainer>` rend correctement `<UsersDisplay>` - vérifier que la requête ajax est déclenchée avec le bon endpoint, etc, est la responsabilité de `<UsersDisplay>`, qui devrait être testé dans le fichier de test `<UsersDisplay>`.

Une façon d'empêcher le `<UsersDisplay>` d'initier la requête ajax est de _stub_ le composant. Écrivons nos propres composants et testons-les, afin de mieux comprendre les différentes manières et les avantages d'utiliser les stubs.

## Création des composants

Cet exemple va utiliser deux composants. Le premier est `ParentWithAPICallChild`, qui rend simplement un autre composant :

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

`<ParentWithAPICallChild>` est un composant simple. Sa seule responsabilité est de rendre `<ComponentWithAsyncCall>`. `<ComponentWithAsyncCall>`, comme son nom l'indique, fait un appel ajax en utilisant le client http `axios` :

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

`<ComponentWithAsyncCall>` appelle `makeApiCall` dans le crochet du cycle de vie `created`.

## Ecrivez un test utilisant `mount`.

Commençons par écrire un test pour vérifier que `<ComponentWithAsyncCall>` est rendu. Notez que `findComponent` est utilisé. `find` est utilisé pour interroger les éléments du DOM, et utilise la syntaxe `querySelector`. `findComponent` est utilisé pour rechercher un composant spécifique, il prend un composant comme argument.

```js
import { shallowMount, mount } from '@vue/test-utils'
import ParentWithAPICallChild from '@/components/ParentWithAPICallChild.vue'
import ComponentWithAsyncCall from '@/components/ComponentWithAsyncCall.vue'

describe('ParentWithAPICallChild.vue', () => {
  it('renders with mount and does initialize API call', () => {
    const wrapper = mount(ParentWithAPICallChild)

    expect(wrapper.findComponent(ComponentWithAsyncCall).exists()).toBe(true)
  })
})
```

L'exécution de `yarn test:unit` donne :

```
PASS  tests/unit/ParentWithAPICallChild.spec.js

console.log src/components/ComponentWithAsyncCall.vue:17
  Making api call
```

Le test est réussi - c'est bien ! Cependant, nous pouvons faire mieux. Remarquez le `console.log` dans la sortie du test - il provient de la méthode `makeApiCall`. Idéalement, nous ne voulons pas faire d'appels à des services externes dans nos tests unitaires, en particulier lorsque c'est à partir d'un composant qui n'est pas l'objectif principal du test en cours. Nous pouvons utiliser l'option de montage `stubs`, décrite dans la docs `vue-test-utils` [ici](https://next.vue-test-utils.vuejs.org/migration/#mocks-and-stubs-are-now-in-global).

## Utiliser `stubs` pour "stuber" `<ComponentWithAsyncCall>`

Mettons à jour le test, cette fois-ci en utilisant `<ComponentWithAsyncCall>` :

```js
it('renders with mount and does initialize API call', () => {
  const wrapper = mount(ParentWithAPICallChild, {
    global: {
      stubs: {
        ComponentWithAsyncCall: true
      },
    },
  })

  expect(wrapper.find(ComponentWithAsyncCall).exists()).toBe(true)
})
```

Le test passe toujours lorsque `yarn test:unit` est lancé, mais le `console.log` n'apparaît nulle part. C'est parce que passer `[component] : true` à `stubs` a remplacé le composant original par un _stub_. L'interface externe est toujours la même (nous pouvons toujours la sélectionner en utilisant `find`, puisque la propriété `name`, qui est utilisée en interne par `find`, est toujours la même). Les méthodes internes, telles que `makeApiCall`, sont remplacées par des méthodes factices qui ne font rien - elles sont "stubées".

Vous pouvez également spécifier le balisage à utiliser pour le stub, si vous le souhaitez :

```js
const wrapper = mount(ParentWithAPICallChild, {
  stubs: {
    ComponentWithAsyncCall: "<div class='stub'></div>"
  }
})
```

## Stubbing automatique avec `shallowMount`.

Au lieu d'utiliser `mount` et de stubber manuellement `<ComponentWithAsyncCall>`, nous pouvons simplement utiliser `shallowMount`, qui stubera automatiquement tous les autres composants par défaut. Le test avec `shallowMount` ressemble à ceci :

```js
it('renders with shallowMount and does not initialize API call', () => {
  const wrapper = shallowMount(ParentWithAPICallChild)

  expect(wrapper.find(ComponentWithAsyncCall).exists()).toBe(true)
})
```

L'exécution de `yarn test:unit` ne montre pas de `console.log`, et le test passe. `shallowMount` a automatiquement stubé `<ComponentWithAsyncCall>`. `shallowMount` est utile pour tester des composants qui ont beaucoup de composants enfants, qui peuvent avoir un comportement déclenché par des hooks de cycle de vie comme `created` ou `mounted`, et ainsi de suite. J'ai tendance à utiliser `mount` par défaut, sauf si j'ai une bonne raison d'utiliser `shallowMount`. Cela dépend de votre cas d'utilisation, et de ce que vous testez. Essayez de faire ce qui est le plus proche de la façon dont vos composants seront utilisés en production.

## Conclusion

- `stubs` est utile pour stubber le comportement des enfants qui n'est pas lié au test unitaire en cours.
- `shallowMount` supprime les composants enfants par défaut.
- Vous pouvez passer `true` pour créer un stub par défaut, ou passer votre propre implémentation personnalisée.

Vous pouvez trouver le test décrit sur cette page [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app-vue-3/tests/unit/ParentWithAPICallChild.spec.js).
