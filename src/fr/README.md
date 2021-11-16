:::tip Ce livre est écrit pour Vue.js 2 et Vue Test Utils v1.
Vous trouverez la version Vue.js 3 [ici](/v3/fr).
:::

## Qu'est-ce que ce guide ?

Bienvenue dans le manuel de test Vue.js !


Il s'agit d'un collection court ciblé sur la façon de tester les composants de Vue Il utilise `vue-test-utils`, la bibliothèque officielle pour tester les composant de Vue et Jest un framework de test moderne. Il couvre l'API `vue-test-utils` ainsi que les meilleures pratiques pour tester les composants.  

Chaque section est indépendante des autres. Nous commençons par créer un environnement avec `vue-cli` et écrire un simple test. Ensuite, nous discuterons des deux possibilités de rendre un composant par `mount` et `shallowMount`. Les différences seront démontrées et expliquées.

Ensuite, nous verrons comment tester différents scénarios qui se présentent quand nous testerons les composants, comme par exemple :

- recevoir les "props"
- utiliser les propriétés "computed"
- renvoyer d'autres "composant"
- émettre des événements

Et ainsi de suite. Nous passerons ensuite à des cas plus intéressants, tels que :

-  les meilleurs pratiques pour tester Vuex (dans les composants et de manière indépendante)
- tester Vue router
- testing involving third party components

Nous étudierons également comment utiliser les API de Jest pour rendre nos tests plus robustes, par exemple :

- les réponses mocking API
- les modules mocking et spying
- utiliser snapshots

## Lectures complémentaires

Parmi les autres ressources utiles, citons :

- [La doc officiel](https://vue-test-utils.vuejs.org/)
- [Livre](https://www.manning.com/books/testing-vue-js-applications) écrit par l'un des auteurs de `vue-test-utils` (en anglais)
- Mon [Vue.js 3 + Unit Testing Course](https://vuejs-course.com) (début 2002, les premiers modules en avant-première/révision disponibles)
- [This awesome course on VueSchool](https://vueschool.io/courses/learn-how-to-test-vuejs-components?friend=vth) par plusieurs contributeurs de l'équipe de Vue (en anglais)
