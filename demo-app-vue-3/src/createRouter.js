import Vue from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'

const createVueRouter = () => {
  return createRouter({
    history: createMemoryHistory(),
    routes: []
  })
}

export { createVueRouter }

