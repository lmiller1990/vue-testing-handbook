:::tip Ce livre est écrit pour Vue.js 2 et Vue Test Utils v1.
Vous trouverez la version Vue.js 3 [ici](/v3/fr).
:::

## La Composition API

Vue 3 va introduire une nouvelle API pour la création de composants - [Composition API](https://vue-composition-api-rfc.netlify.com/#basic-example). Pour permettre aux utilisateurs de l'essayer et d'obtenir des commentaires, l'équipe Vue a publié un plugin qui nous permet de l'essayer dans Vue2. Vous pouvez le trouvez [ici](https://github.com/vuejs/composition-api).

Tester la construction d'un composant avec Composition API ne devrait pas être de tester un composant standard, puisque que nous ne testons pas l'implémentation, mais la sortie (*ce que* le composant fait , et pas *comment* il le fait). Cet article montre un exemple simple d'un composant utilisant le Compostion API dans Vue 2, et comment les stratégies de test sont les mêmes que pour tout autre composant.

Le code source pour le test décrit dans cette page peut être trouvé [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/CompositionApi.spec.js).

## Le Composant

Sous-le "Hello, World" de la Composition API, plus ou moins. Si vous ne comprenez pas quelque chose, [lisez le RFC](https://vue-composition-api-rfc.netlify.com/) ou allez sur Google; il existe de nombreuses ressources sur la Composition API.

```html
<template>
  <div>
    <div class="message">{{ uppercasedMessage }}</div>
    <div class="count">
      Count: {{ state.count }}
    </div>
    <button @click="increment">Increment</button>
  </div>
</template>

<script>
import Vue from 'vue'
import VueCompositionApi from '@vue/composition-api'

Vue.use(VueCompositionApi)

import {
  reactive,
  computed
} from '@vue/composition-api'

export default {
  name: 'CompositionApi',

  props: {
    message: {
      type: String
    }
  },

  setup(props) {
    const state = reactive({
      count: 0
    })

    const increment = () => {
      state.count += 1
    }

    return {
      state,
      increment,
      uppercasedMessage: computed(() => props.message.toUpperCase())
    }
  }
}
</script>
```

Les deux choses que nous devrons tester ici sont :

1. Le fait de cliquer sur le bouton d'incrémentation augmente-t-il de 1 le `state.count` ?

2. Le message reçu dans les props est-il rendu correctement (transformé en majuscules) ?

## Tester le Message des Props
Il est évident de vérifier que le message est correctement rendu. Nous utilisons simplement "propsData" pour définir la valeur du prop, comme décrit [ici](/components-with-props.html).


```js
import { mount } from "@vue/test-utils"

import CompositionApi from "@/components/CompositionApi.vue"

describe("CompositionApi", () => {
  it("renders a message", () => {
    const wrapper = mount(CompositionApi, {
      propsData: {
        message: "Testing the composition API"
      }
    })

    expect(wrapper.find(".message").text()).toBe("TESTING THE COMPOSITION API")
  })
})
```
Comme prévu, c'est très simple : quelle que soit la façon dont nous créons les composants, nous utilisons la même API et la même stratégie pour les tests. Vous devriez pourvoir modifier entièrement l'implémentation et ne pas avoir besoin de toucher aux tests. N'oubliez pas de tester les sorties (le rendu HTML, en général) en fonction des entrées données (accessoires, événements déclenchés), et non de l'implémentation.

## Tester le Bouton Clic

Faire un test pour s'assurer que le fait de cliquer sur le bouton augmente le `state.count` est tout aussi simple. Notez que le test est marqué `async` ; pour en savoir plus sur les raisons de cette exigence, consulter [Simulating User Input](simulating-user-input.html#writing-the-test).

```js
import { mount } from "@vue/test-utils"

import CompositionApi from "@/components/CompositionApi.vue"

describe("CompositionApi", () => {
  it("increments a count when button is clicked", async () => {
    const wrapper = mount(CompositionApi, {
      propsData: { message: '' }
    })

    wrapper.find('button').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find(".count").text()).toBe("Count: 1")
  })
})
```
Encore une fois - nous `déclenchons` l'événement clic, et nous voyons que le rendu `count` a augmenté

## Conclusion

L'article montre comment le teste d'un composant à l'aide Composition API est identique au test d'un composant à l'aide de l'option traditionnelles de l'API. Les idées et les concepts sont les mêmes. Le point principal à apprendre est que lors de la rédaction des tests, il faut faire des affirmations basées sur les entrées et les sorties.


Il devrait être possible de re-factoriser n'importe quel composant traditionnel de Vue pour utiliser le Component API sans avoir à modifier les tests unitaires. Si vous devez modifier vos tests lors de la refonte, vous testez probablement l'implémentation" et non la sortie.

Bien qu'il s'agisse d'une nouvelle fonctionnalité passionnante, l'API de composition est entièrement additive, il n'y a donc pas de besoin immédiat de l'utiliser. Cependant, quel que soit votre choix, rappelez-vous qu'un bon test unitaire affirme l'état final du composant, sans tenir compte des détails de l'implémentation.
