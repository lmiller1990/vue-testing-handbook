import Vue from 'vue'
import { createStore } from 'vuex'

const createVuexStore = (initialState = {}) => createStore({
  state() {
    return {
      authenticated: false,
      posts: [],
      ...initialState,
    }
  },
  mutations: {
    ADD_POSTS(state, posts) {
      state.posts = [...state.posts, ...posts]
    },

    SET_AUTH(state, authenticated) {
      state.authenticated = authenticated
    },
  }
})

export { createVuexStore }

