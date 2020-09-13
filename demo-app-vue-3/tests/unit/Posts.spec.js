import Vuex from 'vuex'
import VueRouter from 'vue-router'
import { mount, createLocalVue } from '@vue/test-utils'

import Posts from '../../src/components/Posts.vue'
import { createVueRouter } from '../../src/createRouter'
import { createVuexStore } from '../../src/createStore'

const createWrapper = (component, options = {}, storeState = {}) => {
  const store = createVuexStore(storeState)
  const router = createVueRouter()

  return mount(component, {
    global: {
      plugins: [
        store, router
      ]
    },
    ...options
  })
}

describe('Posts.vue', () => {
  it('renders a message if passed', () => {
    const message = 'New content coming soon!'
    const wrapper = createWrapper(Posts, {
      props: { message },
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
