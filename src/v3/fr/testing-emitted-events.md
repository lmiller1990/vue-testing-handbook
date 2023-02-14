:::tip Ce livre est écrit pour Vue.js 3 et Vue Test Utils v2.
Vous trouverez la version Vue.js 2 [ici](/fr).
:::

## Tester les événements émis

Plus les applications sont grandes, plus le nombre de composants augmente. Lorsque ces composants ont besoin de partager des données, les composants enfants peuvent [emit](https://vuejs.org/v2/api/#vm-emit) un événement, et le composant parent répond.

`vue-test-utils` fournit une API `emitted` qui nous permet de faire des affirmations sur les événements émis. La documentation de `emitted` se trouve [ici](https://vue-test-utils.vuejs.org/api/wrapper/emitted.html).

Le code source du test décrit sur cette page peut être trouvé [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app-vue-3/tests/unit/Emitter.spec.js).

## Écrire un composant et le tester

Construisons un composant simple. Créez un composant `<Emitter>`, et ajoutez le code suivant.

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
En utilisant l'[API émise](https://vue-test-utils.vuejs.org/ja/api/wrapper/emitted.html) fournie par `vue-test-utils`, nous pouvons facilement voir les événements émis.

Exécutez le test avec `yarn test:unit`.

```
PASS  tests/unit/Emitter.spec.js
● Console

  console.log tests/unit/Emitter.spec.js:10
    { myEvent: [ [ 'name', 'password' ] ] }
```

## syntaxe émise

`emitted` renvoie un objet. Les événements émis sont sauvegardés comme propriétés de l'objet. Vous pouvez inspecter les événements en utilisant `emitted().[event]` :

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

Exécutez le test avec `yarn test:unit` :

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

Le test est réussi.

## Tester les événements sans monter le composant

Parfois, vous pouvez vouloir tester les événements émis sans monter le composant. Vous pouvez le faire en utilisant `call`. Écrivons un autre test.

```js
it("emits an event without mounting the component", () => {
  const events = {}
  const $emit = (event, ...args) => { events[event] = [...args] }

  Emitter.methods.emitEvent.call({ $emit })

  expect(events.myEvent).toEqual(["name", "password"])
})
```

Puisque `$emit` est juste un objet JavaScript, vous pouvez simuler `$emit`, et en utilisant `call` l'attacher au contexte `this` de `emitEvent`. En utilisant `call`, vous pouvez appeler une méthode sans monter le composant. 

L'utilisation de `call` peut être utile dans les situations où vous avez un traitement lourd dans les méthodes du cycle de vie comme `created` et `mounted` que vous ne voulez pas exécuter. Comme vous ne montez pas le composant, les méthodes du cycle de vie ne sont jamais appelées. Cela peut également être utile lorsque vous souhaitez manipuler le contexte `this` d'une manière spécifique.

En général, vous ne voulez pas appeler la méthode manuellement comme nous le faisons ici - si votre composant émet un événement lorsqu'un bouton est cliqué, alors vous voulez probablement faire `wrapper.find('button').click()` à la place. Cet article a pour but de démontrer d'autres techniques.

## Conclusion

- L'API `emitted` de `vue-test-utils` est utilisée pour faire des affirmations sur les événements émis.
- `emitted` est une méthode. Elle retourne un objet avec des propriétés correspondant aux événements émis.
- Chaque propriété de `emitted` est un tableau. Vous pouvez accéder à chaque instance d'un événement émis en utilisant la syntaxe de tableau `[0]`, `[1]`.
- les arguments des événements émis sont également sauvegardés sous forme de tableaux, et vous pouvez y accéder en utilisant la syntaxe des tableaux `[0]`, `[1]`.
- `$emit` peut être simulé à l'aide de `call`, les affirmations peuvent être faites sans rendre le composant.

Le code source du test décrit sur cette page est disponible [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app-vue-3/tests/unit/Emitter.spec.js).
