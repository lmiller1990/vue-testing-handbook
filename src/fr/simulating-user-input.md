:::tip Ce livre est écrit pour Vue.js 2 et Vue Test Utils v1.
Vous trouverez la version Vue.js 3 [ici](/v3/fr).
:::

## Les Événements déclencheurs

Une des choses les plus courantes que vos composants Vue feront est d'écouter les inputs de l'utilisateur. `vue-test-utils` et Jest facilitent les tests des inputs. Voyons comment utiliser les `trigrer` et les simulations de Jest pour vérifier le bon fonctionnement de nos composants.

Vous pouvez trouver le code source de cette page [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/FormSubmitter.spec.js).

## La Création d'un composant

Nous allons créer un simple composant formulaire, `<FormSubmitter>`, qui contient un `<input>` et un `<button>`. Lorsque l'on clique sur le bouton, quelque chose devrait se produire. Le premier exemple révélera simplement un message de réussite, puis nous passerons à un exemple plus intéressant qui soumet le formulaire à un point final externe.


Créez un `<FormSubmitter>` et entrez le modèle :

```html
<template>
  <div>
    <form @submit.prevent="handleSubmit">
      <input v-model="username" data-username>
      <input type="submit">
    </form>

    <div
      class="message"
      v-if="submitted"
    >
      Thank you for your submission, {{ username }}.
    </div>
  </div>
</template>
```
Lorsque l'utilisateur soumettra le formulaire, nous révélerons un message le remerciant d'avoir rempli le formulaire. Nous voulons que l'envoie du formulaire se fasse asynchrone, c'est pourquoi nous utilisons `@submit.prevent` pour empêcher l'action par défaut, qui est de rafraîchir la page lorsque le formulaire est envoyé.

Maintenant ajoutons la logique d'envoi du formulaire :

```html
<script>
  export default {
    name: "FormSubmitter",

    data() {
      return {
        username: '',
        submitted: false
      }
    },

    methods: {
      handleSubmit() {
        this.submitted = true
      }
    }
  }
</script>
```
Assez simple, nous définissons simplement `submitted` comme `true` lors de l'envoie du formulaire, ce qui révèle la `<div>` contenant le message de réussite.


## Passez le test

Voyons un test. Nous notons ce test comme "asynchrone" - lisez la suite pour savoir pourquoi.

```js
import { shallowMount } from "@vue/test-utils"
import FormSubmitter from "@/components/FormSubmitter.vue"

describe("FormSubmitter", () => {
  it("reveals a notification when submitted", async () => {
    const wrapper = shallowMount(FormSubmitter)

    wrapper.find("[data-username]").setValue("alice")
    wrapper.find("form").trigger("submit.prevent")
    await wrapper.vm.$nextTick()

    expect(wrapper.find(".message").text())
      .toBe("Thank you for your submission, alice.")
  })
})
```

Ce test s'explique assez facilement. Nous "moutons" (`shallowMount`) le composant, définissons le nom d'utilisateur et utilisons la méthode que `vue-test-utils` fournie `trigger` pour simuler les entrées de l'utilisateur. `trigger` fonctionne sur des événements personnalisés, ainsi que sur des événements qui utilisent modificateurs, comme `submit.prevent`, `keydown.enter`, et ainsi de suite.

Remarquez qu'après avoir appelé `trigger`, nous faisons un `await wrapper.vm.$nextTick()`. C'est pourquoi nous avons dû marquer le test comme `async` - pour pouvoir utiliser `await`. A partir de la version beta 28 de `vue-test-utils`, vous devez appeler `nextTick` pour vous assurer que le système de réactivité de Vue met à jour le DOM. Parfois, vous pouvez vous en sortir sans appeler `nextTick`, mais si vos composants deviennent plus complexes, vous pouvez rencontrer des problèmes d'exécution et votre affirmation pourrait s'exécuter avant que Vue n'ait mis à jour le DOM. Vous pouvez en savoir plus à ce sujet dans la documentation officielle [vue-test-utils documentation](https://vue-test-utils.vuejs.org/guides/#updates-applied-by-vue).


Le test ci-dessous suit également les trois étapes du test unitaire :


1. Arranger (mise en place pour le test. Dans notre cas, nous rendons le composant).
2. Agir (exécuter des actions sur le système).
3. Affirmer (s'assurer que le résultat réel correspond à vos attentes).

Nous séparons chaque étape par une nouvelle ligne car cela rend le test plus lisible.

Lancez le test avec `yarn test:unit`. Il devrait réussir.


**Trigger** est très simple - utilisez `find` pour obtenir l'élément que vous voulez simuler dans notre input, et appeler `trigger` avec le nom de l'événement et tout modificateur

## Un exemple concret

Les formulaires sont généralement envoyé à la fin. Voyons comment nous pourrions tester ce composant avec une implémentation différente de `handleSublit`. Une pratique commun est d'assigner votre librairie HTTP à `Vue.prototype.$http`. Cela nous permet de faire une requête ajax en appelant simplement `this.$http.get(...)`. Pour en savoir plus sur cette pratique [ici](https://vuejs.org/v2/cookbook/adding-instance-properties.html).

Souvent, la bibliothèque est, `axios`, un client HTTP populaire. Dans ce cas, notre `handlSubmit` ressemblerait probablement à ceci :

```js
handleSubmitAsync() {
  return this.$http.get("/api/v1/register", { username: this.username })
    .then(() => {
      // show success message, etc
    })
    .catch(() => {
      // handle error
    })
}
```

Dans ce cas, une technique consiste de simuler `this.$http` pour créer l'environnement de test souhaité. Vous pouvez consulter l'option de montage des `simulations` [ici](https://vue-test-utils.vuejs.org/api/options.html#mocks). Voyons une implémentation fictive de la méthode `http.get` :

```js
let url = ''
let data = ''

const mockHttp = {
  get: (_url, _data) => {
    return new Promise((resolve, reject) => {
      url = _url
      data = _data
      resolve()
    })
  }
}
```
Il y a quelque chose d'intéressant qui se passe ici :

- Nous créons une variable `url` et `data` pour sauvegarder l'`url` et `data` passé à `$http.get`. Ceci est utile pour affirmer que la requête atteint le point final, avec le bon retour (payload).
- Après avoir assigné les arguments `url` et `data`, nous résolvons immédiatement la Promesse pour simuler une réponse de l'API positive.

Avant de voir le test, voici la nouvelle fonction de ``handleSubmitAsync`` :

```js
methods: {
  handleSubmitAsync() {
    return this.$http.get("/api/v1/register", { username: this.username })
      .then(() => {
        this.submitted = true
      })
      .catch((e) => {
        throw Error("Something went wrong", e)
      })
  }
}
```
Aussi, mettez à jour de `<template>` pour utiliser la nouvelle méthode de `handleSubmitAsync` :


```html
<template>
  <div>
    <form @submit.prevent="handleSubmitAsync">
      <input v-model="username" data-username>
      <input type="submit">
    </form>

  <!-- ... -->
  </div>
</template>
```

Maintenant, il ne reste plus que le test.

## Simuler un appel en ajax

Premièrement, inclure l'implémentation de `this.$http` au début, avant le bloc `describe` :

```js
let url = ''
let data = ''

const mockHttp = {
  get: (_url, _data) => {
    return new Promise((resolve, reject) => {
      url = _url
      data = _data
      resolve()
    })
  }
}
```

Maintenant ajouter le test, en passant la simulation `$http` à l'option de montage `mocks` :

```js
it("reveals a notification when submitted", () => {
  const wrapper = shallowMount(FormSubmitter, {
    mocks: {
      $http: mockHttp
    }
  })

  wrapper.find("[data-username]").setValue("alice")
  wrapper.find("form").trigger("submit.prevent")

  expect(wrapper.find(".message").text())
    .toBe("Thank you for your submission, alice.")
})
```

Maintenant, au lieu d'utiliser la vraie bibliothèque http qui est attachée à `Vue.prototype.$http`, on utilisera la fausse implémentation. C'est une bonne chose - nous pouvons contrôler l'environnement du test et obtenir des résultats cohérents.


L'exécution de `yarn test:unit` donne en fait un test d'échec :
```sh
FAIL  tests/unit/FormSubmitter.spec.js
  ● FormSubmitter › reveals a notification when submitted

    [vue-test-utils]: find did not return .message, cannot call text() on empty Wrapper
```

Ce qui se passe, c'est que le test se termine _avant_ que la promesse retournée par `mockHttp` se résolve. Nous pouvons faire en sorte que le test soit asynchrone comme ceci :

```js
it("reveals a notification when submitted", async () => {
  // ...
})
```

Toutefois, le test se terminera encore avant que la promesse ne soit tenue. Une façon de contourner ce problème est d'utiliser [flush-promises](https://www.npmjs.com/package/flush-promises), un simple module de Node.js qui résoudra immédiatement toutes les promesses en attente. Installez-le avec `yarn add flush-promises`, et mettez à jour le test comme suit :

```js
import flushPromises from "flush-promises"
// ...

it("reveals a notification when submitted", async () => {
  const wrapper = shallowMount(FormSubmitter, {
    mocks: {
      $http: mockHttp
    }
  })

  wrapper.find("[data-username]").setValue("alice")
  wrapper.find("form").trigger("submit.prevent")

  await flushPromises()

  expect(wrapper.find(".message").text())
    .toBe("Thank you for your submission, alice.")
})
```
L'utilisation de `flush-promises` a l'effet de garantir que toutes les promesses, y compris `nextTick`, ont été résolu et Vue a mis à jour le DOM.

Maintenant le test est réussi. Le code source de `flush-promises` ne fait qu'environ 10 lignes, si vous vous intéressez à Node.js, cela vaut la peine de lire et de comprendre comment il fonctionne.

Nous devons également nous assurer que le point final et le payload sont correct. Ajoutez deux autres affirmations au test :

```js
// ...
expect(url).toBe("/api/v1/register")
expect(data).toEqual({ username: "alice" })
```

Le test est toujours réussi.

## Conclusion

Dans cette section, nous avons vu comment faire :

- Utiliser `trigger` sur les événements, même ceux qui utilisent des modificateurs comme `prevent`.
- Utiliser `setValue` pour définr une valeur d'un `<input>` en utilisant `v-model`.
- Passer des tests en utilisant les trois étapes des tests unitaires.
- Simuler une méthode attachée à `Vue.prototype` en utilisant l'option de montage `mocks`.
- Comment utiliser les `flush-promises` pour résoudre immédiatement toutes les promesses, une technique utile dans les essais unitaires


Le code source du test décrit sur cette page peut être trouvé [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/FormSubmitter.spec.js).
