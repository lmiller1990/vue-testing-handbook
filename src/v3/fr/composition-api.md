:::tip Ce livre est écrit pour Vue.js 3 et Vue Test Utils v2.
Vous trouverez la version Vue.js 2 [ici](/fr).
:::

## L'API de composition

Vue 3 a introduit une nouvelle API pour créer des composants - l'[API de composition](https://vue-composition-api-rfc.netlify.com/#basic-example).

Tester un composant créé avec l'API de composition ne devrait pas être différent de tester un composant standard, puisque nous ne testons pas l'implémentation, mais le résultat (*ce que* le composant fait, pas *comment* il le fait). Cet article montre un exemple simple de composant utilisant l'API de composition dans Vue 2, et comment les stratégies de test sont les mêmes que pour tout autre composant.

Le code source du test décrit sur cette page est disponible [ici](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app-vue-3/tests/unit/CompositionApi.spec.js).

## Le composant

Voici le "Hello, World" de l'API de composition, plus ou moins. Si vous ne comprenez pas quelque chose, [lisez la RFC](https://vue-composition-api-rfc.netlify.com/) ou cherchez sur Google ; il existe de nombreuses ressources sur l'API de composition.

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
import { reactive, computed } from 'vue'

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

1. Est-ce que cliquer sur le bouton d'incrémentation augmente `state.count` de 1 ?

2. Est-ce que le message reçu dans les props s'affiche correctement (transformé en majuscules) ?

## Tester le message des accessoires

Tester que le message est correctement rendu est trivial. Nous utilisons simplement `props` pour définir la valeur du prop, comme décrit [ici](/components-with-props.html).

```js
import { mount } from "@vue/test-utils"

import CompositionApi from "@/components/CompositionApi.vue"

describe("CompositionApi", () => {
  it("renders a message", () => {
    const wrapper = mount(CompositionApi, {
      props: {
        message: "Testing the composition API"
      }
    })

    expect(wrapper.find(".message").text()).toBe("TESTING THE COMPOSITION API")
  })
})
```

Comme prévu, c'est très simple : quelle que soit la manière dont nous composons les composants, nous utilisons la même API et les mêmes stratégies de test. Vous devriez être en mesure de modifier entièrement l'implémentation, sans avoir à toucher aux tests. N'oubliez pas de tester les résultats (le HTML rendu, généralement) en fonction des entrées données (accessoires, événements déclenchés), et non l'implémentation.

## Tester le clic du bouton

Ecrire un test pour s'assurer qu'un clic sur le bouton incrémente le `state.count` est tout aussi simple. Remarquez que le test est marqué `async` ; lisez plus sur les raisons pour lesquelles cela est nécessaire dans [Simulation de l'entrée utilisateur](simulating-user-input.html#writing-the-test).

```js
import { mount } from "@vue/test-utils"

import CompositionApi from "@/components/CompositionApi.vue"

describe("CompositionApi", () => {
  it("increments a count when button is clicked", async () => {
    const wrapper = mount(CompositionApi, {
      props: { message: '' }
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.find(".count").text()).toBe("Count: 1")
  })
})
```

Encore une fois, tout à fait inintéressant - nous `déclenchons` l'événement de clic, et affirmons que le `count` rendu a augmenté.

## Conclusion

Cet article démontre que le test d'un composant à l'aide de l'API de composition est identique au test d'un composant à l'aide de l'API d'options traditionnelle. Les idées et les concepts sont les mêmes. Le point principal à retenir est que lors de l'écriture des tests, il faut faire des assertions basées sur les entrées et les sorties. 

Il devrait être possible de remanier n'importe quel composant Vue traditionnel pour utiliser l'API de composition sans avoir à modifier les tests unitaires. Si vous devez modifier vos tests lors du remaniement, il est probable que vous testez l'implémentation et non la sortie. 

Bien qu'il s'agisse d'une nouvelle fonctionnalité intéressante, l'API de composition est entièrement additive, il n'y a donc pas de besoin immédiat de l'utiliser. Cependant, quel que soit votre choix, rappelez-vous qu'un bon test unitaire affirme l'état final du composant, sans tenir compte des détails de l'implémentation.
