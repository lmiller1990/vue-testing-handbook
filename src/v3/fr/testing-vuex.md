:::tip Ce livre est écrit pour Vue.js 3 et Vue Test Utils v2.
Vous trouverez la version Vue.js 2 [ici](/fr).
:::

## Tester Vuex

Les prochains guides traitent du test de Vuex.

### Les deux côtés du test de Vuex

En général, les composants interagissent avec Vuex en

1. engager une mutation
2. envoyant une action
3. accédant à l'état via `$store.state` ou getters

Ces tests ont pour but d'affirmer que le composant se comporte correctement en fonction de l'état actuel du magasin Vuex. Ils n'ont pas besoin de connaître l'implémentation des mutateurs, actions ou getters.

Toute logique exécutée par le magasin, comme les mutations et les getters, peut être testée de manière isolée. Les magasins Vuex étant constitués de fonctions JavaScript ordinaires, ils peuvent facilement faire l'objet de tests unitaires.

Les premiers guides abordent les techniques permettant de tester Vuex de manière isolée en tenant compte des mutations, des actions et des getters. Les guides suivants présentent des techniques pour tester les composants qui utilisent un magasin Vuex et s'assurer qu'ils se comportent correctement en fonction de l'état du magasin.
