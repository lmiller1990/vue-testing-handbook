<template>
  <aside class="sidebar">
    <!--
      <CarbonAds />
    -->
    <a href="https://lachlan-miller.me/design-patterns-for-vuejs/" target="_blank">
      <img
        id="ad"
        style="border: 1px solid blue"
        :src="$withBase('./patterns.png')"
        alt='vuejs-course banner'
      />
    </a>
    <br />
    <div class="info">
      <small>
      Hi! Sign up for an early version and discount on my new book, 
      <a href="https://lachlan-miller.me/design-patterns-for-vuejs" target="_blank"><em>Design</em></a>
      <a href="https://lachlan-miller.me/design-patterns-for-vuejs" target="_blank"><em>Patterns</em></a>
      <a href="https://lachlan-miller.me/design-patterns-for-vuejs" target="_blank"><em>for</em></a>
      <a href="https://lachlan-miller.me/design-patterns-for-vuejs" target="_blank"><em>Vue.js</em></a>
      <a href="https://lachlan-miller.me/design-patterns-for-vuejs" target="_blank"><em>a test driven</em></a>
      <a href="https://lachlan-miller.me/design-patterns-for-vuejs" target="_blank"><em>approach to</em></a>
      <a href="https://lachlan-miller.me/design-patterns-for-vuejs" target="_blank"><em>maintainable</em></a>
      <a href="https://lachlan-miller.me/design-patterns-for-vuejs" target="_blank"><em>applications</em>.</a>
      </small>
    </div>

    <!-- https://vuejs-course.com/ -->

    <!--

    <VueSchool />

    <div
      class="info"
    >
      Prefer videos? I recommend Vue School's

      <a
        href="https://vueschool.io/courses/learn-how-to-test-vuejs-components?friend=vth"
        target="_blank"
        @click="track"
    
        >
          Testing Vue.js
        </a>

        <a
          target="_blank"
          href="https://vueschool.io/courses/learn-how-to-test-vuejs-components?friend=vth"
          @click="track"
        >
          Components course
        </a>

        to learn vue-test-utils, Jest and the other tooling with guys who literally built Vue.js.
    </div>

    -->

    <!--
      <img id="ad" :src="$withBase('ad.png')" />
      <script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CE7DKK3L&placement=lmiller1990githubio" id="_carbonads_js"></script>
    -->
    <NavLinks/>
    <slot name="top"/>
    <SidebarLinks :depth="0" :items="items"/>
    <slot name="bottom"/>
  </aside>
</template>

<script>
import SidebarLinks from '@theme/components/SidebarLinks.vue'
import NavLinks from '@theme/components/NavLinks.vue'
import CarbonAds from '@theme/components/CarbonAds.vue'
import VueSchool from '@theme/components/VueSchool.vue'

export default {
  name: 'Sidebar',

  components: { SidebarLinks, NavLinks, CarbonAds, VueSchool },

  props: ['items'],

  methods: {
    track() {
      console.log('Opening Vue school')
      window.ga('send', 'event', 'affiliate', 'click', 'vue-school')
    }
  }
}
</script>

<style lang="stylus">

#carbonads {
  display: block;
  overflow: hidden;
  padding: 10px;
  box-shadow: 0 1px 3px hsla(0, 0%, 0%, .05);
  border-radius: 4px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', Helvetica, Arial, sans-serif;
  line-height: 1.5;
  max-width: 300px;
  font-size: 12px;
  background-color: #fff;
  margin: 15px;
}

#carbonads a {
  text-decoration: none;
}

#carbonads span {
  position: relative;
  display: block;
  overflow: hidden;
}

.carbon-img {
  float: left;
  margin-right: 1em;
}

.carbon-img img {
  display: block;
}

.carbon-text {
  display: block;
  float: left;
  max-width: calc(100% - 130px - 1em);
  text-align: left;
  color: #637381;
}

.carbon-poweredby {
  position: absolute;
  left: 142px;
  bottom: 0;
  display: block;
  font-size: 8px;
  color: #c5cdd0;
  font-weight: 500;
  text-transform: uppercase;
  line-height: 1;
  letter-spacing: 1px;
}

#ad
  margin: 5px 10px 0 10px
  width: 93%

.sidebar
  ul
    padding 0
    margin 0
    list-style-type none
  a
    display inline-block
  .nav-links
    display none
    border-bottom 1px solid $borderColor
    padding 0.5rem 0 0.75rem 0
    a
      font-weight 600
    .nav-item, .repo-link
      display block
      line-height 1.25rem
      font-size 1.1em
      padding 0.5rem 0 0.5rem 1.5rem
  & > .sidebar-links
    padding 1.5rem 0
    & > li > a.sidebar-link
      font-size 1.1em
      line-height 1.7
      font-weight bold
    & > li:not(:first-child)
      margin-top .75rem

@media (max-width: $MQMobile)
  .sidebar
    .nav-links
      display block
      .dropdown-wrapper .nav-dropdown .dropdown-item a.router-link-active::after
        top calc(1rem - 2px)
    & > .sidebar-links
      padding 1rem 0

.info
  padding 8px 18px
  font-size: 0.9em
</style>
