import { mount, createLocalVue } from "@vue/test-utils"
import NestedRoute from "../../src/components/NestedRoute.vue"
import mockModule from "../../src/bust-cache.js"

jest.mock("../../src/bust-cache.js", () => ({ bustCache: jest.fn() }))

describe("NestedRoute", () => {
  it("renders a username from query string", () => {
    const username = "alice"
    const wrapper = mount(NestedRoute, {
      global: {
        mocks: {
          $route: {
            params: { username }
          }
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
