:::tip Ce livre est écrit pour Vue.js 2 et Vue Test Utils v1.
Vous trouverez la version Vue.js 3 [ici](/v3/fr).
:::

## Simuler un objet global

`vue-test-utils` fournit une façon simple de simuler un objet global en attaché à `Vue.prototype`, à la fois sur un test de base et établir une simulation par défaut pour tous les tests.
`vue-test-utils` fournit un moyen simple de simuler des objets globaux attachés à `Vue.prototype`, à la fois test par test et pour définir une maquette par défaut pour tous les tests.

Le test utilisé dans l'exemple suivant peut être trouvé [ici](https://github.com/lmiller1990/vue-testing-handbook/blob/master/demo-app/tests/unit/Bilingual.spec.js).

## L'option de montage des simulateurs

L'option de montage des simulateurs ([mocks mounting option](https://vue-test-utils.vuejs.org/api/options.html#mocks)) est un moyen pour attacher la valeur de toutes les propriétés à `Vue.prototype`. Cela comprend généralement :

- `$store`, pour Vuex
- `$router`, pour Vue Router
- `$t`, pour vue-i18n

Et bien d'autres encore.

## Un exemple avec vue-i18n

L'utilisation avec Vuex et Vue Router sont abordés dans les sections respectives, [ici](./vuex-in-components.md) et [ici](./vue-router.md). Voyons un exemple avec [vue-i18n](https://github.com/kazupon/vue-i18n). Il serait possible d'utiliser `createLovalVue` et d'installer `vue-i18n` pour chaque test, mais cela deviendrait rapidement encombrant et introduiraot beaucoup d'éléments inutiles. Tout d'abord, un composant `<Bilingual>` qui utilise `vue-i18n`:

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
Le fonctionnement de `vue-i18n` est de déclarer votre traduction dans un autre fichier, puis de le référencer avec `$t`. Pour les besoins de ce test, l'aspect du fichier de traduction n'a pas beaucoup d'importance, mais pour ce composant il pourra ressembler à ceci :

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
En fonction du lieu, la traduction correcte est rendue. Essayons de rendre le composant dans un test, sans simulation :

```js
import { mount } from "@vue/test-utils"
import Bilingual from "@/components/Bilingual.vue"

describe("Bilingual", () => {
  it("renders successfully", () => {
    const wrapper = mount(Bilingual)
  })
})
```

L'exécution de ce test avec `yarn test:unit` renvoie beaucoup d'erreur. Si vous regardez attentivement, vous pouvez voir :

```
[Vue warn]: Error in config.errorHandler: "TypeError: _vm.$t is not a function"
```

C'est parce que nous n'avons pas installer `vue-i18n`, donc la méthode globale `$t` n'existe pas. Faisons une simulation en utilisant l'option de montage `mocks` :

```js
import { mount } from "@vue/test-utils"
import Bilingual from "@/components/Bilingual.vue"

describe("Bilingual", () => {
  it("renders successfully", () => {
    const wrapper = mount(Bilingual, {
      mocks: {
        $t: (msg) => msg
      }
    })
  })
})
```

Maintenant le test passe ! Il y a beaucoup d'option pour `mocks` à utiliser. Le plus souvent, je me retrouve à simuler les objets globaux qui provient des trois paquets mentionnés ci-dessus.

## Régler les simulations par défaut en utilisant config

Parfois vous voulez avoir une valeur par défaut pour la simulation, donc vous ne la créez pas dans un test par un test basique. Vous pouvez utiliser l'API de [config](https://vue-test-utils.vuejs.org/api/#vue-test-utils-config-options) fournie par `vue-test-utils`. Développons l'exemple `vue-i18n`. Vous pouvez définit des modèles par défaut n'importe où en faisant ce qui suit :

```js
import { config } from "@vue/test-utils"

config.mocks["mock"] = "Default Mock Value"
```
Le projet de démo de ce guide utilise Jest, je vais donc déclarer la simulation (mock) par défaut dans `jest.init.js`, qui est chargé avant que les tests ne soient exécutés automatiquement. Je vais également importer l'exemple de notre objet de traduction, et l'utiliser en l'implémentant dans notre simulation.

```js
import VueTestUtils from "@vue/test-utils"
import translations from "./src/translations.js"

const locale = "en"

VueTestUtils.config.mocks["$t"] = (msg) => translations[locale][msg]
```
Maintenant, une véritable traduction sera rendue, malgré l'utilisation de la fonction `$t`. Refaite le test, cette fois en utilisant `console.log` sur`wrapper.html()` et en retirant l'option de montage `mocks`:


```js
describe("Bilingual", () => {
  it("renders successfully", () => {
    const wrapper = mount(Bilingual)

    console.log(wrapper.html())
  })
})
```
Le test passes, et nous pouvons voir le code qui est rendu :

```
<div class="hello">
  Hello world!
</div>
```
Vous pouvez lire des informations sur l'utilisation de `mocks` pour tester Vuex [ici](https://lmiller1990.github.io/vue-testing-handbook/vuex-in-components.html#using-a-mock-store). La technique est la même.

## Conclusion

Nous avons vu :


- L'utilisation de `mocks`pour simuler l'objet global dans un test de base.
- L'utilisation de `config.mocks` pour définir un model par défaut
