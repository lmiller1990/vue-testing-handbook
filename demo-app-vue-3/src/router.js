import { createRouter, createMemoryHistory } from "vue-router"
import routes from "./routes.js"
import { bustCache } from "@/bust-cache.js"

const router = createRouter({ 
  history: createMemoryHistory(),
  routes
})

export function beforeEach(to, from, next) {
  if (to.matched.some(record => record.meta.shouldBustCache)) {
    bustCache()
  }
  next()
}

router.beforeEach((to, from, next) => beforeEach(to, from, next))

export default router
