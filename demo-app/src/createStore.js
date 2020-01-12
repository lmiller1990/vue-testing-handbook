import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const createStore = (initialState = {}) => new Vuex.Store({
  state: {
    authenticated: false,
    posts: [],
    ...initialState,
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

export { createStore }


