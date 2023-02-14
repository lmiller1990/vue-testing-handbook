:::tip Ce livre est écrit pour Vue.js 3 et Vue Test Utils v2.
Vous trouverez la version Vue.js 2 [ici](/fr).
:::

## Réglage des Props

`props` peut être utilisé avec `mount` et `shallowMount`. Il est souvent utilisé pour tester les composants qui reçoivent des props de leur composant parent.

`props` est passé dans le second argument de `shallowMount` ou de `mount`, sous la forme suivante :

```js
const wrapper = mount(Foo, {
  props: {
    foo: 'bar'
  }
})
```

## Créer le composant

Créez un composant simple `<SubmitButton>` qui a deux `props` : `msg` et `isAdmin`. En fonction de la valeur de l'attribut `isAdmin`, ce composant contiendra une `<span>` dans l'un des deux états suivants :

* `Not Authorized` si `isAdmin` est faux (ou n'est pas passé en tant que prop)
* `Privilèges d'administrateur` si `isAdmin` est vrai.

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

Nous allons faire une assertion sur le message dans le cas où l'utilisateur n'a pas de privilèges d'administrateur.

```js
import { mount } from '@vue/test-utils'
import SubmitButton from '@/components/SubmitButton.vue'

describe('SubmitButton.vue', () => {
  it("displays a non authorized message", () => {
    const msg = "submit"
    const wrapper = mount(SubmitButton,{
      props: {
        msg: msg
      }
    })

    console.log(wrapper.html())

    expect(wrapper.find("span").text()).toBe("Not Authorized")
    expect(wrapper.find("button").text()).toBe("submit")
  })
})
```

Exécutez les tests avec `yarn test:unit`. Le résultat est le suivant :

```
PASS  tests/unit/SubmitButton.spec.js
  SubmitButton.vue
    ✓ displays a non authorized message (15ms)
```

Le résultat de `console.log(wrapper.html())` est également affiché :

```html
<div>
  <span>Not Authorized</span>
  <button>
    submit
  </button>
</div>
```

Nous pouvons voir que la prop `msg` est traitée et que le balisage résultant est correctement rendu.

## Un deuxième test

Faisons une assertion sur l'autre état possible, lorsque `isAdmin` est `true` :

```js
import { mount } from '@vue/test-utils'
import SubmitButton from '@/components/SubmitButton.vue'

describe('SubmitButton.vue', () => {
  it('displays a admin privileges message', () => {
    const msg = "submit"
    const isAdmin = true
    const wrapper = mount(SubmitButton,{
      props: {
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

Exécutez le test avec `yarn test:unit` et vérifiez les résultats :

```shell
PASS  tests/unit/SubmitButton.spec.js
  SubmitButton.vue
    ✓ displays a admin privileges message (4ms)
```

Nous avons également sorti le balisage avec `console.log(wrapper.html())` :

```html
<div>
  <span>Admin Privileges</span>
  <button>
    submit
  </button>
</div>
```
Nous pouvons voir que la prop `isAdmin` a été utilisée pour rendre l'élément `<span>` correct.

## Refactorisation les tests

Refactorons les tests en respectant le principe "Don't Repeat Yourself" (DRY). Puisque tous les tests passent, nous pouvons remanier en toute confiance. Tant que les tests passent toujours après le remaniement, nous pouvons être sûrs que nous n'avons rien cassé.

## Refactorisation avec une fonction d'usine

Dans les deux tests, nous appelons `mount` puis nous passons un objet similaire `props`. Nous pouvons remanier cela en utilisant une fonction d'usine. Une fonction factory est simplement une fonction qui retourne un objet - elle _fabrique_ des objets, d'où le nom de fonction "factory".

```js
const msg = "submit"
const factory = (props) => {
  return mount(SubmitButton, {
    props: {
      msg,
      ...props
    }
  })
}
```

Ce qui précède est une fonction qui va "monter" un composant `SubmitButton`. Nous pouvons passer n'importe quel props à modifier comme premier argument de `factory`. Séparons le test avec la fonction factory.

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

Faisons à nouveau les tests. Tout passe toujours.

```sh
PASS  tests/unit/SubmitButton.spec.js
 SubmitButton
   has admin privileges
     ✓ renders a message (26ms)
   does not have admin privileges
     ✓ renders a message (3ms)
```

Puisque nous disposons d'une bonne suite de tests, nous pouvons maintenant remanier facilement et en toute confiance.

## Conclusion

- En passant `props` lors du montage d'un composant, vous pouvez définir les `props` à utiliser dans le test
- Les fonctions d'usine peuvent être utilisées pour DRY vos tests
- Au lieu de `props`, vous pouvez aussi utiliser [`setProps`](https://vue-test-utils.vuejs.org/api/wrapper-array/#setprops-props) pour définir les valeurs des prop pendant les tests.
