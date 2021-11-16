:::tip Ce livre est écrit pour Vue.js 2 et Vue Test Utils v1.
Vous trouverez la version Vue.js 3 [ici](/v3/fr).
:::

## Tester Vuex

Dans les prochaines pages nous verrons le test de Vuex.

## Deux possibilités de tester Vuex

En général, les composants interagissent avec Vuex en :

1. Avec le commit pour une mutation
2. Avec le dispatch une action
3. Accéder au state via `$store.state` ou les getters

Ces tests ont pour but d'affirmer que le composant se comporte correctement en fonction de l'état actuel du store de Vuex. Ils n'ont pas besoin de connaître la mise en œuvre des mutateurs, des actions ou des getters.

Toute logique exécutée par le store, comme les mutations et les getters, peut être testée de manière isolée. Comme les stores de Vuex sont composés de fonctions JavaScript ordinaires, ils sont facilement testés à l'unité.

Les premières pages traitent des techniques permettant de tester Vuex de manière isolée en tenant compte des mutations, des actions et des getters. Les pages suivantes présentent quelques techniques pour tester les composants qui utilisent un store de Vuex, et s'assurer qu'ils se comportent correctement en fonction de l'état du magasin.