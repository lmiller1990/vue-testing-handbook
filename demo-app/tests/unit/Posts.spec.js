import Vuex from 'vuex'
import VueRouter from 'vue-router'
import { mount, createLocalVue } from '@vue/test-utils'

import Posts from '@/components/Posts.vue'
import { createRouter } from '@/createRouter'
import { createStore } from '@/createStore'

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

describe('Posts.vue', () => {
  it('renders a message if passed', () => {
    const message = 'New content coming soon!'
    const wrapper = createWrapper(Posts, {
      propsData: { message },
    })

    expect(wrapper.find("#message").text()).toBe('New content coming soon!')
  })

  it('renders posts', async () => {
    const wrapper = createWrapper(Posts, {}, {
      posts: [{ id: 1, title: 'Post' }]
    })

    expect(wrapper.findAll('.post').length).toBe(1)
  })

  it('renders new post link if authenticated', async () => {
    const wrapper = createWrapper(Posts, {}, {
      authenticated: true
    })

    expect(wrapper.find('.new-post').exists()).toBe(true)
  })

  it('does not render new post link if not authenticated', async () => {
    const wrapper = createWrapper(Posts, {}, {
      authenticated: false
    })

    expect(wrapper.find('.new-post').exists()).toBe(false)
  })
})
