:::tip Ce livre est écrit pour Vue.js 2 et Vue Test Utils v1.
Vous trouverez la version Vue.js 3 [ici](/v3/fr).
:::

## Test des événements émis

Le nombre de composants augmente au fur et à mesure que les applications se développent. Lorsque ces composants ont besoin de partager des données, les composants enfants peuvent [émettre](https://vuejs.org/v2/api/#vm-emit) un événement, et le composant parent répond.

`vue-test-utils` fournit une API `emitted` qui nous permet de faire des affirmations sur les événements émis. La documentation relative à `emitted` se trouve [ici](../vue-test-utils/wrapper/emitted.md).
Le code source du test décrit sur cette page peut être trouvé [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/Emitter.spec.js).

## Écrire un composant et un test

Construisons un composant simple. Créez un composant `<Emitter>` et ajouter le code suivant.

```html
<template>
  <div>
  </div>
</template>

<script>
  export default {
    name: "Emitter",

    methods: {
      emitEvent() {
        this.$emit("myEvent", "name", "password")
      }
    }
  }
</script>

<style scoped>
</style>
```
Ajoutez un test appelé `emitEvent` :

```js
import Emitter from "@/components/Emitter.vue"
import { mount } from "@vue/test-utils"

describe("Emitter", () => {
  it("emits an event with two arguments", () => {
    const wrapper = mount(Emitter)

    wrapper.vm.emitEvent()

    console.log(wrapper.emitted())
  })
})
```
En utilisant l'[emitted API](https://vue-test-utils.vuejs.org/ja/api/wrapper/emitted.html) fournie par `vue-test-utils`, nous pouvons facilement voir les événements émis.

Lancez le test avec `yarn test:unit`.

```
PASS  tests/unit/Emitter.spec.js
● Console

  console.log tests/unit/Emitter.spec.js:10
    { myEvent: [ [ 'name', 'password' ] ] }
```

## La syntaxe émise

`emitted` retourne un objet. Les évènements émis sont sauvés comme propriété de l'objet. Vous pouvez inspecter les évènements en utilisant `emitted().[event]`:

```js
emitted().myEvent //=>  [ [ 'name', 'password' ] ]
```

Essayons d'appeler `emitEvent` deux fois.

```js
it("emits an event with two arguments", () => {
  const wrapper = mount(Emitter)

  wrapper.vm.emitEvent()
  wrapper.vm.emitEvent()

  console.log(wrapper.emitted().myEvent)
})
```
Lancez le test avec `yarn test:unit`.

```
console.log tests/unit/Emitter.spec.js:11
  [ [ 'name', 'password' ], [ 'name', 'password' ] ]
```

`emitted().emitEvent` renvoie un tableau. La première instance de `emitEvent` est accessible en utilisant `emitted().emitEvent[0]`. Les arguments sont accessibles en utilisant une syntaxe similaire, `emitted().emitEvent[0][0]` et ainsi de suite.

Faisons une affirmation réelle contre l'événement émis.


```js
it("emits an event with two arguments", () => {
  const wrapper = mount(Emitter)

  wrapper.vm.emitEvent()

  expect(wrapper.emitted().myEvent[0]).toEqual(["name", "password"])
})
```

Le test passe.

## Tester les événements sans monter le composant

Parfois, vous pouvez vouloir tester les événements émis sans avoir à monter le composant. Vous pouvez le faire en utilisant `call`. Ecrivons un autre test.

```js
it("emits an event without mounting the component", () => {
  const events = {}
  const $emit = (event, ...args) => { events[event] = [...args] }

  Emitter.methods.emitEvent.call({ $emit })

  expect(events.myEvent).toEqual(["name", "password"])
})
```
Puisque `$emit` est juste un objet JavaScript, vous pouvez simuler un `$emit` et en utilisant `call` pour l'arracher au contexte de `this` de `$emitEvent`. En utilisant `call`, vous pouvez appeler une méthode sans monter le composant.  

L'utilisation de `call` peut être utile dans les situations où vous avez des traitements lourds dans les méthodes de cycle de vie comme `created` et `mounted` que vous ne voulez pas exécuter. Comme vous ne montez pas le composant, les méthodes de cycle de vie ne sont jamais appelées. Cela peut également être utile lorsque vous voulez manipuler le contexte `this` d'une manière spécifique.

## Conclusion

-  L'API `emitted` de `vue-test-utils` est utilisée pour faire des affirmations sur les événements émis
- `emitted` est une méthode. Elle renvoie un objet avec des propriétés correspondant aux événements émis
- Chaque propriété de `emitted` est un tableau. Vous pouvez accéder à chaque instance d'un événement émis en utilisant la syntaxe de tableau `[0]`, `[1]` et
- Les arguments des événements émis sont également enregistrés sous forme de tableaux, et peuvent être consultés en utilisant la syntaxe de tableau `[0]`, `[1]`.
- `$emit` can be mocked using `call`, affirmations can be made without rendering the component
- On peut simuler des `$emit` en utilisant `call`, on peut faire des affirmations sans rendre le composant

Le code source du test décrit sur cette page peut être trouvé [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/Emitter.spec.js).

