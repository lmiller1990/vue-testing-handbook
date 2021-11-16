:::tip Ce livre est écrit pour Vue.js 3 et Vue Test Utils v2.
Vous trouverez la version Vue.js 2 [ici](/fr).
:::

## Événements déclencheurs

Une des choses les plus communes que vos composants Vue feront sera d'écouter les entrées de l'utilisateur. `vue-test-utils` et Jest permettent de tester facilement les entrées. Voyons comment utiliser `trigger` et Jest mocks pour vérifier que nos composants fonctionnent correctement.

Le code source du test décrit sur cette page peut être trouvé [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app-vue-3/tests/unit/FormSubmitter.spec.js).

## Création du composant

Nous allons créer un composant de formulaire simple, `<FormSubmitter>`, qui contient un `<input>` et un `<button>`. Lorsque le bouton est cliqué, quelque chose doit se produire. Le premier exemple va simplement révéler un message de réussite, puis nous passerons à un exemple plus intéressant qui soumet le formulaire à un endpoint externe.

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

Lorsque l'utilisateur soumet le formulaire, nous affichons un message le remerciant de sa soumission. Nous voulons soumettre le formulaire de manière asynchrone, donc nous utilisons `@submit.prevent` pour empêcher l'action par défaut, qui est de rafraîchir la page lorsque le formulaire est soumis.

Maintenant, ajoutez la logique de soumission du formulaire :

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

Assez simple, nous mettons juste `submitted` à `true` quand le formulaire est soumis, ce qui à son tour révèle le `<div>` contenant le message de succès.

## Écrire le test

Voyons un test. Nous marquons ce test comme `async` - lisez la suite pour savoir pourquoi.

```js
import { mount } from "@vue/test-utils"
import FormSubmitter from "@/components/FormSubmitter.vue"

describe("FormSubmitter", () => {
  it("reveals a notification when submitted", async () => {
    const wrapper = mount(FormSubmitter)

    await wrapper.find("[data-username]").setValue("alice")
    await wrapper.find("form").trigger("submit.prevent")

    expect(wrapper.find(".message").text())
      .toBe("Thank you for your submission, alice.")
  })
})
```

Ce test est assez explicite. Nous montons le composant, définissons le nom d'utilisateur et utilisons la méthode `trigger` fournie par `vue-test-utils` pour simuler une entrée utilisateur. `trigger` fonctionne sur les événements personnalisés, ainsi que sur les événements qui utilisent des modificateurs, comme `submit.prevent`, `keydown.enter`, et ainsi de suite.

Remarquez que lorsque nous appelons `setValue` et `trigger`, nous utilisons `await`. C'est pourquoi nous avons dû marquer le test comme `async` - pour pouvoir utiliser `await`. 

`setValue` et `trigger` retournent tous deux, en interne, `Vue.nextTick()`. A partir de `vue-test-utils` beta 28, vous devez appeler `nextTick` pour vous assurer que le système de réactivité de Vue met à jour le DOM. En faisant `await setValue(...)` et `await trigger(...)`, vous n'utilisez en fait qu'un raccourci pour :

```js
wrapper.setValue(...)
await wrapper.vm.$nextTick() // "Attendez que le DOM se mette à jour avant de continuer le test"
```

Parfois, vous pouvez vous en sortir sans attendre le `nextTick`, mais si vos composants commencent à être complexes, vous pouvez rencontrer une situation de course et votre affirmation pourrait s'exécuter avant que Vue n'ait mis à jour le DOM. Vous pouvez en savoir plus à ce sujet dans la documentation officielle [vue-test-utils documentation](https://vue-test-utils.vuejs.org/guLe test ci-dessus suit également les trois étapes des tests unitaires :

1. arranger (préparer le test ; dans notre cas, nous rendons le composant).
2. agir (exécuter des actions sur le système)
3. affirmer (s'assurer que le résultat réel correspond à vos attentes).

Nous séparons chaque étape avec une nouvelle ligne car cela rend les tests plus lisibles.

Exécutez ce test avec `yarn test:unit`. Il devrait passer.

Trigger est très simple - utilisez `find` (pour les éléments DOM) ou `findComponent` (pour les composants Vue) pour obtenir l'élément que vous voulez simuler une entrée, et appelez `trigger` avec le nom de l'événement, et les modificateurs éventuels.
ides/#updates-applied-by-vue).

## Un exemple concret

Les formulaires sont généralement soumis à un point de terminaison. Voyons comment nous pourrions tester ce composant avec une implémentation différente de `handleSubmit`. Une pratique courante est d'aliaser votre bibliothèque HTTP à `Vue.prototype.$http`. Cela nous permet de faire une requête ajax en appelant simplement `this.$http.get(...)`. Apprenez-en plus sur cette pratique [ici](https://vuejs.org/v2/cookbook/adding-instance-properties.html). 

Souvent la bibliothèque http est, `axios`, un client HTTP populaire. Dans ce cas, notre `handleSubmit` ressemblerait probablement à quelque chose comme ceci :

```js
handleSubmitAsync() {
  return this.$http.get("/api/v1/register", { username: this.username })
    .then(() => {
      // afficher le message de réussite, etc.
    })
    .catch(() => {
      // gérer l'erreur
    })
}
```

Dans ce cas, une technique consiste à _mock_ `this.$http` pour créer l'environnement de test souhaité. Vous pouvez vous renseigner sur l'option de montage `global.mocks` [ici](https://vue-test-utils.vuejs.org/api/options.html#mocks). Voyons une implémentation fantaisie d'une méthode `http.get` :

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

Il y a plusieurs choses intéressantes qui se passent ici :

- nous créons une variable `url` et `data` pour sauvegarder le `url` et le `data` passés à `$http.get`. C'est utile pour affirmer que la requête atteint le bon terminal, avec le bon contenu.
- Après avoir assigné les arguments `url` et `data`, nous résolvons immédiatement la Promise, pour simuler une réponse API réussie.

Avant de voir le test, voici la nouvelle fonction `handleSubmitAsync` :

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

Mettez également à jour `<template>` pour utiliser la nouvelle méthode `handleSubmitAsync` :

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

Maintenant, seulement le test.

## Simulation d'un appel ajax

Premièrement, incluez l'implémentation fantaisie de `this.$http` en haut, avant le bloc `describe` :

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

Maintenant, ajoutez le test, en passant la simulation `$http` à l'option de montage `global.mocks` :

```js
it("reveals a notification when submitted", () => {
  const wrapper = mount(FormSubmitter, {
    global: {
      mocks: {
        $http: mockHttp
      }
    }
  })

  wrapper.find("[data-username]").setValue("alice")
  wrapper.find("form").trigger("submit.prevent")

  expect(wrapper.find(".message").text())
    .toBe("Thank you for your submission, alice.")
})
```

Maintenant, au lieu d'utiliser la bibliothèque http réelle attachée à `Vue.prototype.$http`, l'implémentation fantaisie sera utilisée à la place. C'est une bonne chose - nous pouvons contrôler l'environnement du test et obtenir des résultats cohérents.

L'exécution de `yarn test:unit` donne en fait un test qui échoue :

```sh
FAIL  tests/unit/FormSubmitter.spec.js
  ● FormSubmitter › reveals a notification when submitted

    [vue-test-utils]: find did not return .message, cannot call text() on empty Wrapper
```

Ce qui se passe, c'est que le test se termine _avant_ que la promesse retournée par `mockHttp` soit résolue. Encore une fois, nous pouvons rendre le test asynchrone comme ceci :

```js
it("reveals a notification when submitted", async () => {
  // ...
})
```

Maintenant, nous devons nous assurer que le DOM a été mis à jour et que toutes les promesses ont été résolues avant que le test ne continue. `await wrapper.setValue(...)` n'est pas toujours fiable ici non plus, car dans ce cas, nous n'attendons pas que Vue mette à jour le DOM, mais qu'une dépendance externe (notre client HTTP simulé, dans ce cas) soit résolue. 

Une façon de contourner ce problème est d'utiliser [flush-promises](https://www.npmjs.com/package/flush-promises), un simple module Node.js qui résoudra immédiatement toutes les promesses en attente. Installez-le avec `yarn add flush-promises`, et mettez à jour le test comme suit (nous ajoutons aussi `await wrapper.setValue(...)` pour faire bonne mesure) :

```js
import flushPromises from "flush-promises"
// ...

it("reveals a notification when submitted", async () => {
  const wrapper = mount(FormSubmitter, {
    global: {
      mocks: {
        $http: mockHttp
      }
    }
  })

  await wrapper.find("[data-username]").setValue("alice")
  await wrapper.find("form").trigger("submit.prevent")

  await flushPromises()

  expect(wrapper.find(".message").text())
    .toBe("Thank you for your submission, alice.")
})
```

Maintenant le test passe. Le code source de `flush-promises` ne fait qu'une dizaine de lignes, si vous êtes intéressés par Node.js, cela vaut la peine de le lire et de comprendre son fonctionnement.

Nous devons aussi nous assurer que le endpoint et le payload sont corrects. Ajoutez deux autres affirmations au test :

```js
// ...
expect(url).toBe("/api/v1/register")
expect(data).toEqual({ username: "alice" })
```

Le test passe toujours.

## Conclusion

Dans cette section, nous avons vu comment :

- utiliser `trigger` sur les événements, même ceux qui utilisent des modificateurs comme `prevent`.
- utiliser `setValue` pour définir la valeur d'une `<input>` en utilisant `v-model`
- utiliser `await` avec `trigger` et `setValue` pour `await Vue.nextTick` et s'assurer que le DOM a été mis à jour.
- écrire des tests en utilisant les trois étapes des tests unitaires
- simuler une méthode attachée à `Vue.prototype` en utilisant l'option de montage `global.mocks`.
- comment utiliser `flush-promises` pour résoudre immédiatement toutes les promesses, une technique utile dans les tests unitaires.

Le code source du test décrit sur cette page peut être trouvé [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app-vue-3/tests/unit/FormSubmitter.spec.js).
