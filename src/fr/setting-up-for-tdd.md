:::tip Ce livre est écrit pour Vue.js 2 et Vue Test Utils v1.
Vous trouverez la version Vue.js 3 [ici](/v3/fr).
:::

## Installation de vue-cli

`vue-test-utils` est la librairie officielle de test pour Vue, et nous l'utiliserons tout au long de ce guide. Elle fonctionne à la fois du côté navigateur et dans l'environnement Node.js, et fonctionne avec n'importe quel programme de test. Nous effectuerons nos tests dans un environnement Node.js tout au long de ce guide.

Le plus simple est de commencer par `vue-cli`. Il permettra de mettre en place un projet, ainsi que de configurer Jest, un framework populaire de test, Installez-le en exécutant :


```sh
yarn global add @vue/cli
```

ou avec npm:

```sh
npm install -g @vue/cli
```
Créer un nouveau projet en lançant `vue create [project-name]`. Choisir "Manually select features" et "Unit Testing", et "Jest" pour le lanceur de test.

Une fois l'installation terminée, `cd` dans le projet et lancez `yarn test:unit`. Si tout s'est bien passé, vous devriez voir :

```
 PASS  tests/unit/HelloWorld.spec.js
  HelloWorld.vue
    ✓ renders props.msg when passed (26ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        2.074s
```
Félicitation, vous venez juste de passer votre premier test !


## Ecrire votre premier test

Nous avons effectué un test qui vient avec le projet. Nous allons nous salir les mains, en écrivant notre propre composant, et un test. Traditionnellement, lorsque l'on fait du TDD, on écrit d'abord le test qui échoue, puis on implémente le code qui permet au test de réussir. Pour l'instant, nous allons d'abord écrire le composant.

Nous n'avons pas besoin de `src/components/HelloWorld.vue` ou de `tests/unit/HelloWorld.spec.js`, donc nous pouvons les supprimer


## Créer le composant `Greeting`

Créer un fichier `Greetind.vue` dans `src/components`. A l'intérieur de `Greeting.vue`, nous ajoutons ce qui suit :


```vue
<template>
  <div>
    {{ greeting }}
  </div>
</template>

<script>
export default {
  name: "Greeting",

  data() {
    return {
      greeting: "Vue and TDD"
    }
  }
}
</script>
```

## Ecrire le test

`Greeting` n'a que seul responsabilité - de rendre la valeur de `greeting`. La stratégie sera :


1. Rendre de composant avec `mount`
2. Affirmer que le texte du composant contient "Vue and TDD"

Créer un fichier `Greeting.spec.js` dans le dossier `tests/unit`. A l'intérieur, importer `Greeting.vue`, ainsi que `mount` et ajouter le contour du test :

```
import { mount } from '@vue/test-utils'
import Greeting from '@/components/Greeting.vue'

describe('Greeting.vue', () => {
  it('renders a greeting', () => {

  })
})
```

Il y a différentes syntaxes pour utiliser les TDD, nous utiliserons la syntaxe `describe` et `it` qui est fournie avec Jest. Le terme `describe` décrit en général l'objet du test, dans notre cas `Greeting.vue`. `it` représente lui qu'une partie du test qui doit être rempli. Comme nous ajouterons des fonctionnalités au composant, nous ajouterons d'autres blocks `it`.

Maintenant vous voulons rendre le composant avec `mount`. La pratique standard est d'assigner le composant à une variable appelé `wrapper`. Nous allons aussi afficher la sortie, pour nous assurer que tout fonctionne correctement :

```js
const wrapper = mount(Greeting)

console.log(wrapper.html())
```

## Lancer le test

Lancer le test en tapant `yarn test:unit`dans votre terminale. Tous les fichiers dans le répertoire `tests` se terminant par `.spec.js` seront automatiquement exécuté. Si tout se passe bien, vous devriez voir :

```
PASS  tests/unit/Greeting.spec.js
Greeting.vue
  ✓ renders a greeting (27ms)

console.log tests/unit/Greeting.spec.js:7
  <div>
    Vue and TDD
  </div>
```

Nous pouvons voir que le code est correct et le test passe. Le test est passé parce qu'il n'y a pas eu d'échec, ce test ne peut jamais échouer, il n'est donc pas encore très utile. Même si nous changeons `Greeting.vue` et supprimons `greeting`du modèle, il passera quand même. Changeons cela.


## Faire des vérifications

Nous devons faire des vérifications pour être sûr que le composant se comporte correctement. Nous pouvons pour cela utilisez l'API `expect` de Jest. Cela ressemble a ceci : `expect(result).to [matcher] (actual)`.


_Les Matchers_ sont des méthodes permettant de comparer des valeurs et des objets. Par exemple :

```js
expect(1).toBe(1)
```

La liste complète des matchers est disponible dans la [documentation de Jest](http://jestjs.io/docs/en/expect). `vue-test-utils` n'inclue aucun matchers - celles que Jest fournit sont plus que suffisantes. Si nous voulons comparer le texte de `Greeting`. Nous pourrions écrire :

```js
expect(wrapper.html().includes("Vue and TDD")).toBe(true)
```

mais `vue-test-utils` a un meilleur  moyen pour obtenir le code - `wrapper.text`. Finissons le test :

```js
import { mount } from '@vue/test-utils'
import Greeting from '@/components/Greeting.vue'

describe('Greeting.vue', () => {
  it('renders a greeting', () => {
    const wrapper = mount(Greeting)

    expect(wrapper.text()).toMatch("Vue and TDD")
  })
})
```

Nous n'avons plus besoin du `console.log`, donc nous pouvons le supprimer. Lancer les tests avec `yarn test:unit` et si tout se passe bien vous devriez voir :

```
PASS  tests/unit/Greeting.spec.js
Greeting.vue
  ✓ renders a greeting (15ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        1.477s, estimated 2s
```
Il a l'air bien. Mais il faut toujours voir le test échouer, pour s'assurer qu'il fonctionne vraiment. Dans la méthode TDD traditionnelle, vous écrivez le test avant la mise en œuvre réelle, puis vous utilisez les erreurs pour guider votre code. Assurons-nous que ce test fonctionne vraiment. Faite cette modification dans `Greeting.vue` :

```vue
<template>
  <div>
    {{ greeting }}
  </div>
</template>

<script>
export default {
  name: "Greeting",

  data() {
    return {
      greeting: "Vue without TDD"
    }
  }
}
</script>
```

Et maintenant tester avec `yarn test:unit` :

```
FAIL  tests/unit/Greeting.spec.js
Greeting.vue
  ✕ renders a greeting (24ms)

● Greeting.vue › renders a greeting

  expect(received).toMatch(expected)

  Expected value to match:
    "Vue and TDD"
  Received:
    "Vue without TDD"

     6 |     const wrapper = mount(Greeting)
     7 |
  >  8 |     expect(wrapper.text()).toMatch("Vue and TDD")
       |                            ^
     9 |   })
    10 | })
    11 |

    at Object.<anonymous> (tests/unit/Greeting.spec.js:8:28)
```

Jest nous donne un bon retour. Nous pouvons voir ce qui est attendu et le résultat réel, ainsi que sur quelle ligne le test a échoué. Le test a échoué, comme prévu. Revenez sur `Greeting.vue`et assurez-vous que le test est à nouveau réussi.

Ensuite nous verrons les deux méthodes que `vue-test-utils` fournit pour rendre les composants : `mount` et `shallowMount`.
