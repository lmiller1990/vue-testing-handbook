:::tip Ce livre est écrit pour Vue.js 3 et Vue Test Utils v2.
Vous trouverez la version Vue.js 2 [ici](/fr).
:::

## Installation de vue-cli

`vue-test-utils` est la bibliothèque de test officielle de Vue, et sera utilisée tout au long de ce guide. Elle fonctionne à la fois dans un navigateur et dans un environnement Node.js, et fonctionne avec n'importe quel gestionnaire de tests. Nous allons exécuter nos tests dans un environnement Node.js tout au long de ce guide.

`vue-cli` est la façon la plus simple de commencer. Il va mettre en place un projet, ainsi que configurer Jest, un framework de test populaire. Installez-le en exécutant :

```sh
yarn global add @vue/cli
```

or with npm:

```sh
npm install -g @vue/cli
```

Créez un nouveau projet en exécutant `vue create [project-name]`. Choisissez "Manually select features" et "Unit Testing", et "Jest" pour le runner de test.

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

Félicitations, vous venez d'exécuter votre premier test réussi !

## Écrire votre premier test

Nous avons exécuté un test existant fourni avec le projet. Mettons nos mains dans le cambouis, en écrivant notre propre composant et un test. Traditionnellement, quand on fait du TDD, on écrit d'abord le test qui échoue, puis on implémente le code qui permet au test de passer. Pour l'instant, nous allons écrire le composant en premier.

Nous n'avons plus besoin de `src/components/HelloWorld.vue` ou `tests/unit/HelloWorld.spec.js`, donc vous pouvez les supprimer.

## Création du composant `Greeting`.

Créez un fichier `Greeting.vue` dans `src/components`. A l'intérieur de `Greeting.vue`, ajoutez ce qui suit :

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

## Écrire le test

`Greeting` n'a qu'une seule responsabilité - rendre la valeur `greeting`. La stratégie sera la suivante :

1. rendre le composant avec `mount`.
2. vérifier que le texte du composant contient "Vue and TDD".

Créez un `Greeting.spec.js` dans `tests/unit`. A l'intérieur, importez `Greeting.vue`, ainsi que `mount`, et ajoutez le contour du test :

```js
import { mount } from '@vue/test-utils'
import Greeting from '@/components/Greeting.vue'

describe('Greeting.vue', () => {
  it('renders a greeting', () => {

  })
})
```

Il existe différentes syntaxes utilisées pour le TDD, nous utiliserons les syntaxes courantes `describe` et `it` qui sont fournies avec Jest. `describe` décrit généralement le sujet du test, dans ce cas `Greeting.vue`. `it` représente un élément unique de responsabilité que le sujet du test doit remplir. Au fur et à mesure que nous ajoutons des fonctionnalités au composant, nous ajoutons d'autres blocs `it`.

Maintenant, nous devons rendre le composant avec `mount`. La pratique standard est d'assigner le composant à une variable appelée `wrapper`. Nous allons également imprimer la sortie, pour nous assurer que tout fonctionne correctement :

```js
const wrapper = mount(Greeting)

console.log(wrapper.html())
```

## Exécution du test

Exécutez le test en tapant `yarn test:unit` dans votre terminal. Tout fichier dans le répertoire `tests` se terminant par `.spec.js` est automatiquement exécuté. Si tout s'est bien passé, vous devriez voir :

```
PASS  tests/unit/Greeting.spec.js
Greeting.vue
  ✓ renders a greeting (27ms)

console.log tests/unit/Greeting.spec.js:7
  <div>
    Vue and TDD
  </div>
```

Nous pouvons voir que le balisage est correct, et que le test passe. Le test passe parce qu'il n'y a pas eu d'échec - ce test ne peut jamais échouer, donc il n'est pas encore très utile. Même si nous changeons `Greeting.vue` et supprimons le `greeting` du modèle, il passera toujours. Changeons cela.

## Faire des affirmations (assertions)

Nous devons faire une affirmation pour nous assurer que le composant se comporte correctement. Nous pouvons le faire en utilisant l'API `expect` de Jest. Cela ressemble à ceci : `expect(result).to [matcher] (actual)`. 

Les "matcher" sont des méthodes permettant de comparer des valeurs et des objets. Par exemple :

```js
expect(1).toBe(1)
```

Une liste complète des matchers est disponible dans la [documentation Jest](http://jestjs.io/docs/en/expect). `vue-test-utils` n'inclut pas de matchers - ceux que Jest fournit sont plus que suffisants. Nous voulons comparer le texte de `Greeting`. Nous pourrions écrire :

```js
expect(wrapper.html().includes("Vue and TDD")).toBe(true)
```

mais `vue-test-utils` a une meilleure façon de récupérer le balisage - `wrapper.text`. Finissons le test :

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

Nous n'avons plus besoin du fichier `console.log`, donc vous pouvez le supprimer. Exécutez les tests avec `yarn unit:test`, et si tout s'est bien passé vous devriez obtenir :

```
PASS  tests/unit/Greeting.spec.js
Greeting.vue
  ✓ renders a greeting (15ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        1.477s, estimated 2s
```

Ça a l'air bien. Mais vous devriez toujours voir un test échouer, puis réussir, pour être sûr qu'il fonctionne vraiment. Dans le TDD traditionnel, vous écrivez le test avant l'implémentation réelle, vous le voyez échouer, puis vous utilisez les erreurs d'échec pour guider votre code. Assurons-nous que ce test fonctionne vraiment. Mise à jour de `Greeting.vue` :

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

Et maintenant, lancez le test avec `yarn test:unit` :

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

Jest nous donne un bon retour d'information. Nous pouvons voir le résultat attendu et le résultat réel, ainsi que la ligne sur laquelle l'attente a échoué. Le test a échoué, comme prévu. Reversez `Greeting.vue` et assurez-vous que le test passe à nouveau.

## Utilisation de Vue 3 et de l'API de composition

Vue 3 ajoute une autre API pour construire des composants - l'API de composition. Un signe d'un bon test est que nous évitons de tester les détails d'implémentation (comment le code fonctionne) mais que nous nous concentrons plutôt sur le comportement (ce que le code fait). Refactorisons le composant ci-dessus et voyons ce qui se passe. Si le test passe toujours, nous savons qu'il teste les bonnes choses. S'il échoue, nous pourrions tester un détail d'implémentation.

```ts
<template>
  <div>
    {{ greeting }}
  </div>
</template>

<script lang="ts">
export default {
  name: 'Greeting',
  setup() {
    const greeting = 'Vue and TDD';

    return {
      greeting,
    };
  },
};
</script>
```

Lorsque vous débutez avec l'API de composition, vous oubliez souvent d'ajouter la variable au retour. Essayez de l'omettre et voyez comment le test échoue. Si vous prévoyez de convertir certains de vos composants de l'API Options en API Composition, certains tests peuvent vous mettre en confiance et fournir une boucle de rétroaction positive pendant le remaniement.

## Suivant

Ensuite, nous allons examiner les deux méthodes que `vue-test-utils` fournit pour rendre les composants : `mount` et `shallowMount`.
