## 테스트에서 보일러플레이트 줄이기

> 이 글은 [Vue.js Courses](https://vuejs-course.com/screencasts/reducing-duplication-in-tests.html?ref=vth)에서 스크린캐스트(코딩하는 화면 같이 컴퓨터 화면을 녹화한 비디오)로 이용할 수 있습니다. [여기](https://vuejs-course.com/screencasts/reducing-duplication-in-tests.html?ref=vth)를 확인해주세요.

보통은 컴포넌트의 새 복사본을 가지고 각각의 유닛 테스트를 진행하는 게 이상적입니다. 더 나아가서 여러분의 앱이 더 커지고 복잡해질수록, 컴포넌트는 많고 다양한 props를 가질 것이고, 아마 Vuetify, VueRouter나 Vuex 같은 3rd 파티 라이브러리를 여러 개 설치했을 것입니다. 이런 부분은 여러분의 테스트에 많은 보일러플레이트 코드를 야기할 수 있습니다. 보일러플레이트 코드는 테스트와 직접적으로 관련이 없는 코드를 의미합니다.

이 글은 Vuex, VueRouter를 사용하는 컴포넌트를 가지고, 유닛 테스트를 위한 설정 코드의 양을 줄이는 일을 도와주는 몇 가지 패턴을 설명합니다.

이 페이지에서 설명한 테스트의 소스 코드는 [여기](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/Posts.spec.js)서 찾을 수 있습니다.

## Posts 컴포넌트

아래의 코드가 테스트할 컴포넌트입니다. `message` prop이 보이고, 한 태그가 받고 있습니다. 사용자가 인증된 상태이고, 몇 개의 포스트를 가지고 있다면 새로운 Post 버튼을 보여줍니다.  `authenticated`와 `posts` 객체 둘 다 Vuex 스토어에서 받습니다. 결과적으로 포스트의 링크를 보여주는 `router-link` 컴포넌트를 렌더합니다.

```vue
<template>
  <div>
    <div id="message" v-if="message">{{ message }}</div>

    <div v-if="authenticated">
      <router-link 
        class="new-post" 
        to="/posts/new"
      >
        New Post
      </router-link>
    </div>

    <h1>Posts</h1>
    <div 
      v-for="post in posts" 
      :key="post.id" 
      class="post"
    >
      <router-link :to="postLink(post.id)">
        {{ post.title }}
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Posts',
  props: {
    message: String,
  },

  computed: {
    authenticated() {
      return this.$store.state.authenticated
    },

    posts() {
      return this.$store.state.posts
    }
  },

  methods: {
    postLink(id) {
      return `/posts/${id}`
    }
  }
}
</script>
```

테스트하고 싶은 부분은 아래와 같습니다.

- prop을 받았을 때 `message`가 렌더되는가?
- `posts`는 정확하게 렌더되는가?
- New Post 버튼은 `authenticated`가 `true`일 때는 보이고, `false`일때는 숨겨지는가?

이상적으로 테스트는 가능한 명료해야 합니다.

## Vuex/VueRouter 팩토리 함수

좀 더 테스트하기 편한 앱을 만들 수 있는 좋은 방법은 Vuex나 VueRouter를 위한 팩토리 함수를 내보내는 것입니다. 보통 여러분은 아래와 같은 코드를 보게 됩니다.

```js
// store.js

export default new Vuex.Store({ ... })

// router.js
export default new VueRouter({ ... })
```

일반적인 앱에서는 괜찮지만 테스트할 때는 이상적이지 않습니다. 이렇게 하면, 테스트에서 매번 스토어(store)나 라우터(router)를 사용해야 하고, 스토어나 라우터를 추출한 다른 모든 테스트에 걸쳐서 공유될 것입니다. 이상적으로 모든 컴포넌트는 스토어와 라우터의 새 복사본을 가져야 합니다.

이 작업을 수행하는 간단한 방법은 팩토리 함수를 추출하는 것입니다. 팩토리 함수는 객체의 새 인스턴스를 반환하는 함수를 말합니다. 예를 들면 아래와 같습니다.

```js
// store.js
export const store = new Vuex.Store({ ... })
export const createStore = () => {
  return new Vuex.Store({ ... })
}

// router.js
export default new VueRouter({ ... })
export const createRouter = () => {
  return new Vuex.Router({ ... })
}
```

이제 메인 앱은 `import { store } from './store.js'`를 할 수 있고, 테스트에서는 `import { createStore } from './store.js'`를 하고 `const store = createStore()`로 인스턴스를 만듦으로써 매번 스토어의 새로운 복사본을 가질 수 있습니다. 라우터도 동일합니다. 이게 `Posts.vue` 예제에서 하려고 하는 일입니다. 스토어 코드는 [여기](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/src/createStore.js)서 라우터 코드는 [여기](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/src/createRouter.js)서 찾을 수 있습니다.

## 테스트 (리팩토링 하기 전)

이제 `Posts.vue`와 스토어와 라우터가 어떻게 보일지 알고, 테스트가 무엇을 해야할지 이해할 수 있습니다.

```js
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import { mount, createLocalVue } from '@vue/test-utils'

import Posts from '@/components/Posts.vue'
import { createRouter } from '@/createRouter'
import { createStore } from '@/createStore'

describe('Posts.vue', () => {
  it('통과하면 메시지를 렌더한다.', () => {
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    localVue.use(Vuex)

    const store = createStore()
    const router = createRouter()
    const message = 'New content coming soon!'
    const wrapper = mount(Posts, {
      propsData: { message },
      store, router,
    })

    expect(wrapper.find("#message").text()).toBe('New content coming soon!')
  })

  it('posts 렌더한다', async () => {
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    localVue.use(Vuex)

    const store = createStore()
    const router = createRouter()
    const message = 'New content coming soon!'

    const wrapper = mount(Posts, {
      propsData: { message },
      store, router,
    })

    wrapper.vm.$store.commit('ADD_POSTS', [{ id: 1, title: 'Post' }])
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.post').length).toBe(1)
  })
})
```

모든 조건을 완벽하게 테스트하지는 않습니다. 간단한 예제이고 시작하기에는 충분합니다. 중복과 반복에 주목하세요. 중복과 반복을 제거하겠습니다.

## 커스텀 `createTestVue` 함수

아래와 같이 각 테스트의 처음 다섯 줄은 동일합니다.

```js
const localVue = createLocalVue()
localVue.use(VueRouter)
localVue.use(Vuex)

const store = createStore()
const router = createRouter()
```

한번 수정해보겠습니다. Vue Test Utils의 `createLocalVue`와 헷갈리지 않게, 새로 만들 함수를  `createTestVue`라고 부르겠습니다. 아래와 같은 모습입니다.

```js
const createTestVue = () => {
  const localVue = createLocalVue()
  localVue.use(VueRouter)
  localVue.use(Vuex)

  const store = createStore()
  const router = createRouter()
  return { store, router, localVue }
}
```

이제 하나의 함수 안에 모든 로직을 캡슐화했습니다. `store`, `router` 그리고 `localVue`를 반환합니다. `mount` 함수에 인자로 넘기는 데 필요하기 때문입니다.

`createTestVue`를 사용해서 첫 번째 테스트를 리팩토링한다면, 아래와 같은 모습이 됩니다.

```js
it('통과하면 메시지를 렌더한다', () => {
  const { localVue, store, router } = createTestVue()
  const message = 'New content coming soon!'
  const wrapper = mount(Posts, {
    propsData: { message },
    store,
    router,
    localVue
  })

  expect(wrapper.find("#message").text()).toBe('New content coming soon!')
})
```

좀 더 명료합니다. Vuex 스토어를 사용하고 있는 두 번째 테스트를 리팩토링해 보겠습니다.

```js
it('posts를 렌더한다', async () => {
  const { localVue, store, router } = createTestVue()
  const wrapper = mount(Posts, {
    store,
    router,
  })

  wrapper.vm.$store.commit('ADD_POSTS', [{ id: 1, title: 'Post' }])
  await wrapper.vm.$nextTick()

  expect(wrapper.findAll('.post').length).toBe(1)
})
```

## `createWrapper` 메서드 정의하기

위 코드에서 이전 테스트와 수정된 상태를 비교했을 때 확실히 개선이 있었지만, 코드의 반 정도는 아직 중복된 것을 알 수 있습니다. 이 문제를 처리하기 위해서, `createWrapper`라는 새 메서드를 생성하겠습니다.

```js
const createWrapper = (component, options = {}) => {
  const { localVue, store, router } = createTestVue()
  return mount(component, {
    store,
    router,
    localVue,
    ...options
  })
}
```

이제 `createWrapper`를 호출해서, 테스트할 컴포넌트의 새 복사본을 가지면 됩니다. 이제는 테스트가 매우 명료합니다.

```js
it('통과하면 메시지를 렌더한다', () => {
  const message = 'New content coming soon!'
  const wrapper = createWrapper(Posts, {
    propsData: { message },
  })

  expect(wrapper.find("#message").text()).toBe('New content coming soon!')
})

it('posts를 렌더한다', async () => {
  const wrapper = createWrapper(Posts)

  wrapper.vm.$store.commit('ADD_POSTS', [{ id: 1, title: 'Post' }])
  await wrapper.vm.$nextTick()

  expect(wrapper.findAll('.post').length).toBe(1)
})
```

## 초기 Vuex 상태 설정하기

우리가 할 마지막 개선은 어떻게 Vuex 스토어를 테스트에 붙일까에 대한 것입니다. 실제 애플리케이션에서는 스토어가 복잡할 수 있고, 테스트하기를 원하는 컴포넌트에 상태를 가지려고, 여러 가지 많은 뮤테이션(mutations)이나 액션(actions)을 `commit` 하거나 `dispatch` 하는 것은 이상적이지 않습니다.  `createStore` 함수에 약간의 변화를 줘서, 초기 상태를 더 쉽게 설정할 수 있도록 만들겠습니다.

```js
const createStore = (initialState = {}) => new Vuex.Store({
  state: {
    authenticated: false,
    posts: [],
    ...initialState
  },
  mutations: {
    // ...
  }
})
```

이제 `createStore` 함수를 원하는 초기 상태로 설정할 수 있습니다. 아래와 같이  `createTestVue`와 `createWrapper`를 머지해서 빠르게 리팩토링 할 수 있습니다.

```js
const createWrapper = (component, options = {}, storeState = {}) => {
  const localVue = createLocalVue()
  localVue.use(VueRouter)
  localVue.use(Vuex)
  const store = createStore(storeState)
  const router = createRouter()

  return mount(component, {
    store,
    router,
    localVue,
    ...options
  })
}
```

이제 테스트는 아래와 같이 쓸 수 있습니다.

```js
it('posts를 렌더한다', async () => {
  const wrapper = createWrapper(Posts, {}, {
    posts: [{ id: 1, title: 'Post' }]
  })

  expect(wrapper.findAll('.post').length).toBe(1)
})
```

큰 개선입니다! 코드의 절반가량이 보일러플레이트였던 테스트였고, 실제로 어설션(assertion)과 관련이 있지 않았습니다. 두 줄 중 한 줄은 컴포넌트 테스트를 준비하는 코드였고, 나머지 한 줄이 어설션을 위한 코드였습니다.

이 리팩토링 작업의 덤은, 가지고 있는 모든 테스트에서 사용할 수 있는 유연한 `createWrapper` 함수를 얻었다는 것입니다.

## 개선사항

아래와 같은 몇 가지 잠재적인 개선사항이 있습니다.

- Vuex의 namespaced 모듈의 초기 상태를 설정하도록 해주는 `createStore` 함수를 업데이트합니다
- 특정 라우트를 설정하는 `createRouter`를 개선합니다
- 사용자가 `createWrapper`에 `shallow`나 `mount` 인자를 넘기도록 해줍니다.

## 결론

이 가이드 문서는 아래의 내용에 관해 얘기했습니다.

- 객체의 새 인스턴스를 얻는 팩토리 함수 사용
- 일반적인 행동을 추출해서 보일러플레이트와 중복 줄이기

이 페이지에서 설명한 테스트의 소스 코드는 [여기](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/Posts.spec.js)에서 찾을 수 있습니다. [Vue.js Courses](https://vuejs-course.com/screencasts/reducing-duplication-in-tests.html?ref=vth)에서 스크린캐스트로 이용할 수도 있습니다.
