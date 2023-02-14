:::tip Ce livre est écrit pour Vue.js 3 et Vue Test Utils v2.
Vous trouverez la version Vue.js 2 [ici](/fr).
:::

## Objets globaux de simulation

`vue-test-utils` fournit un moyen simple de simuler les objets globaux attachés à `Vue.prototype`, à la fois pour chaque test et pour définir une simulation par défaut pour tous les tests.

Le test utilisé dans l'exemple suivant peut être trouvé [ici](https://github.com/lmiller1990/vue-testing-handbook/blob/master/demo-app/tests/unit/Bilingual.spec.js).

## L'option de montage des simulations

L'option [montage des simulations](https://vue-test-utils.vuejs.org/api/options.html#mocks) est un moyen de définir la valeur de toutes les propriétés attachées à `Vue.prototype`. Cela inclut généralement :

- `$store`, pour Vuex
- `$router`, pour Vue Router
- `$t`, pour vue-i18n

et bien d'autres.

## Exemple avec vue-i18n

L'utilisation avec Vuex et Vue Router est abordée dans les sections respectives, [ici](https://lmiller1990.github.io/vue-testing-handbook/vuex-in-components.html) et [ici](https://lmiller1990.github.io/vue-testing-handbook/vue-router.html). Voyons un exemple avec [vue-i18n](https://github.com/kazupon/vue-i18n). Bien qu'il soit possible d'utiliser `createLocalVue` et d'installer `vue-i18n` pour chaque test, cela deviendrait rapidement fastidieux et introduirait beaucoup de paperasse. Tout d'abord, un composant `<Bilingual>` qui utilise `vue-i18n` :

```html
<template>
  <div class="hello">
    {{ $t("helloWorld") }}
  </div>
</template>

<script>
  export default {
    name: "Bilingual"
  }
</script>
```

La façon dont `vue-i18n` fonctionne est que vous déclarez votre traduction dans un autre fichier, puis vous les référencez avec `$t`. Dans le cadre de ce test, l'aspect du fichier de traduction n'a pas vraiment d'importance, mais pour ce composant, il pourrait ressembler à ceci :

```js
export default {
  "en": {
    helloWorld: "Hello world!"
  },
  "ja": {
    helloWorld: "こんにちは、世界！"
  }
}
```

En fonction de la locale, la traduction correcte est rendue. Essayons de rendre le composant dans un test, sans aucune simulation.

```js
import { mount } from "@vue/test-utils"
import Bilingual from "@/components/Bilingual.vue"

describe("Bilingual", () => {
  it("renders successfully", () => {
    const wrapper = mount(Bilingual)
  })
})
```

L'exécution de ce test avec `yarn test:unit` génère une énorme trace de pile. Si vous regardez attentivement la sortie, vous pouvez voir :

```
"TypeError: _ctx.$t is not a function"
```

C'est parce que nous n'avons pas installé `vue-i18n`, donc la méthode globale `$t` n'existe pas. Nous allons la simuler en utilisant l'option de montage `mocks` :

```js
import { mount } from "@vue/test-utils"
import Bilingual from "@/components/Bilingual.vue"

describe("Bilingual", () => {
  it("renders successfully", () => {
    const wrapper = mount(Bilingual, {
      global: {
        mocks: {
          $t: (msg) => msg
        }
      }
    })
  })
})
```

Maintenant le test passe ! Il y a beaucoup d'utilisations pour l'option `mocks`. Le plus souvent, je me retrouve à utiliser les objets globaux fournis par les trois paquets mentionnés ci-dessus.

## Paramètres des objets fantaisie par défaut en utilisant config

Parfois, vous voulez avoir une valeur par défaut pour l'objet fantaisie, de sorte que vous ne le créez pas sur une base de test par test. Vous pouvez le faire en utilisant l'API [config](https://vue-test-utils.vuejs.org/api/#vue-test-utils-config-options) fournie par `vue-test-utils`. Développons l'exemple de `vue-i18n`. Vous pouvez définir des mocks par défaut n'importe où en faisant ce qui suit :

```js
import { config } from "@vue/test-utils"


config.global.mocks = {
  mock: "Default Mock Value"
}
```

Le projet de démonstration pour ce guide utilise Jest, donc je vais déclarer le mock par défaut dans `jest.init.js`, qui est chargé avant que les tests soient exécutés automatiquement. J'importerai également l'objet de traduction de l'exemple précédent et l'utiliserai dans l'implémentation de l'objet fantaisie.

```js
import { config } from "@vue/test-utils"
import translations from "./src/translations.js"

const locale = "en"

config.global.mocks = {
  $t: (msg) => translations[locale][msg]
}
```

Maintenant une vraie traduction sera rendue, malgré l'utilisation d'une fonction `$t` simulée. Exécutez à nouveau le test, cette fois en utilisant `console.log` sur `wrapper.html()` et en supprimant l'option de montage `mocks` :

```js
describe("Bilingual", () => {
  it("renders successfully", () => {
    const wrapper = mount(Bilingual)

    console.log(wrapper.html())
  })
})
```

Le test réussit, et la balise suivante est rendue :

```
<div class="hello">
  Hello world!
</div>
```

Vous pouvez lire sur l'utilisation de `mocks` pour tester Vuex [ici](https://lmiller1990.github.io/vue-testing-handbook/vuex-in-components.html#using-a-mock-store). La technique est la même.

## Conclusion

Ce guide a abordé :

- l'utilisation de `global.mocks` pour simuler un objet global sur une base de test par test.
- Utiliser `config.global.mocks` pour définir un objet fantaisie par défaut. 
