:::tip Ce livre est écrit pour Vue.js 2 et Vue Test Utils v1.
Vous trouverez la version Vue.js 3 [ici](/v3/fr).
:::

## Paramétrez les props avec propsData

`propsData` peut être utilisé aussi bien avec `mount` que `shallowMount`. Il est souvent utilisé pour tester les composants qui reçoivent les props de leur composant parent.

`propsData` est passé en deuxième argument de `shallowMount` or `mount`, sous la forme suivante :

```js
const wrapper = shallowMount(Foo, {
  propsData: {
    foo: 'bar'
  }
})
```

## Création d'un composant

Créez un simple composant `<SubmitButton>` qui a deux `props`: `msg` et `isAdmin`. En fonction de la valeur du prop `isAdmin` le `<span>` aura l'un des deux états :

* `Not Authorized` si `isAdmin` est faux (ou non passé comme prop).
* `Admin Privileges` si `isAdmin` est vrai.

```html
<template>
  <div>
    <span v-if="isAdmin">Admin Privileges</span>
    <span v-else>Not Authorized</span>
    <button>
      {{ msg }}
    </button>
  </div>
</template>

<script>
export default {
  name: "SubmitButton",

  props: {
    msg: {
      type: String,
      required: true
    },
    isAdmin: {
      type: Boolean,
      default: false
    }
  }
}
</script>
```

## Le premier test

Nous ferons une affirmation sur le message dans le cas où l'utilisateur n'a pas les privilèges administrateur.

```js
import { mount } from '@vue/test-utils'
import SubmitButton from '@/components/SubmitButton.vue'

describe('SubmitButton.vue', () => {
  it("displays a non authorized message", () => {
    const msg = "submit"
    const wrapper = mount(SubmitButton,{
      propsData: {
        msg: msg
      }
    })

    console.log(wrapper.html())

    expect(wrapper.find("span").text()).toBe("Not Authorized")
    expect(wrapper.find("button").text()).toBe("submit")
  })
})
```

Lancez le test avec `yarn test:unit`. Le résultat est :

```
PASS  tests/unit/SubmitButton.spec.js
  SubmitButton.vue
    ✓ displays a non authorized message (15ms)
```

Le résultat de `console.log(wrapper.html())` va aussi afficher :

```html
<div>
  <span>Not Authorized</span>
  <button>
    submit
  </button>
</div>
```

Nous pouvons voir que le prop `msg` est traité et que le résultat est correctement rendu

## Le deuxième test

Faisons une autre affirmation dans l'autre état possible, quand `isAdmin` est `true` :

```js
import { mount } from '@vue/test-utils'
import SubmitButton from '@/components/SubmitButton.vue'

describe('SubmitButton.vue', () => {
  it('displays a admin privileges message', () => {
    const msg = "submit"
    const isAdmin = true
    const wrapper = mount(SubmitButton,{
      propsData: {
        msg,
        isAdmin
      }
    })

    console.log(wrapper.html())

    expect(wrapper.find("span").text()).toBe("Admin Privileges")
    expect(wrapper.find("button").text()).toBe("submit")
  })
})
```

Lancé le test avec `yarn test:unit` et vérifier  les résultats :

```shell
PASS  tests/unit/SubmitButton.spec.js
  SubmitButton.vue
    ✓ displays a admin privileges message (4ms)
```

Le résultat de `console.log(wrapper.html())` va aussi s'afficher

```html
<div>
  <span>Admin Privileges</span>
  <button>
    submit
  </button>
</div>
```
Nous pouvons voir que le prop `isAdmin` a été utilisé pour renvoyer le correct `<span>` élément.

## Refactoriser les tests

Refactorisons le test en adhérant au principe de "Ne Pas Répétez" (Don't Repeat Yourself (DRY)). Comme tous les tests sont réussis, nous pouvons refactoriser en toute confiance. Tant que tous les tests sont réussis après la refactorisation, nous pouvons être sûrs de n'avoir rien cassé.

## Refactoriser avec une fonction usine

Dans les deux tests, nous appelons `mount` puis nous lui passons l’objet `propsData` similaire. Nous pouvons refactoriser en utilisant une fonction usine. Une fonction usine est simplement une fonction qui nous renvoie un objet (elle fait des objets d’où le nom fonction usine).

```js
const msg = "submit"
const factory = (propsData) => {
  return mount(SubmitButton, {
    propsData: {
      msg,
      ...propsData
    }
  })
}
```
Ce qui précède est une fonction qui va " monter " un composant `SubmitButton`. Nous pouvons faire passer n’importe quel props pour changer comme premier argument à `factory`. DRY (Ne Pas Répétez) le test avec la fonction usine.

```js
describe("SubmitButton", () => {
  describe("does not have admin privileges", ()=> {
    it("renders a message", () => {
      const wrapper = factory()

      expect(wrapper.find("span").text()).toBe("Not Authorized")
      expect(wrapper.find("button").text()).toBe("submit")
    })
  })

  describe("has admin privileges", ()=> {
    it("renders a message", () => {
      const wrapper = factory({ isAdmin: true })

      expect(wrapper.find("span").text()).toBe("Admin Privileges")
      expect(wrapper.find("button").text()).toBe("submit")
    })
  })
})
```
Recommençons les tests. Tout passe encore

```sh
PASS  tests/unit/SubmitButton.spec.js
 SubmitButton
   has admin privileges
     ✓ renders a message (26ms)
   does not have admin privileges
     ✓ renders a message (3ms)
```

Puisque nous avons une suite de test réussi, nous pouvons maintenant facilement et en tout confiance refactoriser

## Conclusion

- En passant `propsData` lors d'un montage d'un composant, nous pouvons définir les `props` à utiliser dans le test.
- Les fonctions usines peuvent être utilisées pour DRY (Ne pas Répétez) les tests
- Au lieu de `propsData`, vous pouvez aussi utiliser [`setProps`](https://vue-test-utils.vuejs.org/api/wrapper-array/#setprops-props) pour définir les valeurs des props pendant les tests.
