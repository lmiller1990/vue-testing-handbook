import { shallowMount, createLocalVue } from "@vue/test-utils"
import VueRouter from "vue-router"
import NestedRoute from "@/components/NestedRoute.vue"
import mockModule from "@/bust-cache.js"

jest.mock("@/bust-cache.js", () => ({ bustCache: jest.fn() }))
const localVue = createLocalVue()
localVue.use(VueRouter)

describe("NestedRoute", () => {
  it("renders a username from query string", () => {
    const username = "alice"
    const wrapper = shallowMount(NestedRoute, {
      mocks: {
        $route: {
          params: { username }
        }
      }
    })

    expect(wrapper.find(".username").text()).toBe(username)
  })

  it("calls bustCache and next when leaving the route", () => {
    const next = jest.fn()
    NestedRoute.beforeRouteLeave(undefined, undefined, next)

    expect(mockModule.bustCache).toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })
})
