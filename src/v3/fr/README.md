:::tip Ce livre est écrit pour Vue.js 3 et Vue Test Utils v2.
Vous trouverez la version Vue.js 2 [ici](/fr).
:::

## Qu'est-ce que ce guide ?

Bienvenue dans le manuel de test de Vue.js !

Il s'agit d'une collection d'exemples courts et ciblés sur la façon de tester les composants Vue. Il utilise `vue-test-utils`, la bibliothèque officielle pour tester les composants Vue, et Jest, un framework de test moderne. Il couvre l'API `vue-test-utils`, ainsi que les meilleures pratiques pour tester les composants.

Chaque section est indépendante des autres. Nous commençons par mettre en place un environnement avec `vue-cli` et écrire un test simple. Ensuite, deux façons de rendre un composant sont discutées - `mount` et `shallowMount`. Les différences seront démontrées et expliquées.

Ensuite, nous verrons comment tester divers scénarios qui se présentent lors du test de composants, comme le test de composants qui :

- reçoivent des props
- utilisent des propriétés calculées
- rendent d'autres composants
- émettent des événements

et ainsi de suite. Nous passons ensuite à des cas plus intéressants, tels que :

- Meilleures pratiques pour tester Vuex (dans les composants, et indépendamment)
- le test du routeur Vue
- tests impliquant des composants tiers

Nous explorerons également comment utiliser l'API Jest pour rendre nos tests plus robustes, par exemple :

- le mocking des réponses API
- le mocking et l'espionnage des modules
- l'utilisation de snapshots

### Lecture complémentaire

D'autres ressources utiles incluent :

- [Documents officiels](https://vue-test-utils.vuejs.org/v2/guide/introduction.html)
- J'ai réalisé des séries gratuites sur Vue Test Utils + Vue 3 : [YouTube playlist](https://www.youtube.com/playlist?list=PLC2LZCNWKL9ahK1IoODqYxKu5aA9T5IOA)
- Mon [Cours Vue.js 3 + Unit Testing](https://vuejs-course.com). VUEJS_COURSE_10_OFF pour une réduction de 10 $ !
- [Ce cours sur VueSchool](https://vueschool.io/courses/learn-how-to-test-vuejs-components?friend=vth) par plusieurs contributeurs de Vue.
