import { mount } from "@vue/test-utils"
import App from "../../src/App.vue"
import { createRouter, createMemoryHistory } from "vue-router"
import NestedRoute from "../../src/components/NestedRoute.vue"
import routes from "../../src/routes.js"

jest.mock("../../src/components/NestedRoute.vue", () => ({
  name: "NestedRoute",
  template: "<div />"
}))

describe("App", () => {
  it("renders a child component via routing", async () => {
    const router = createRouter({ 
      history: createMemoryHistory(),
      routes 
    })
    router.push("/nested-route")
    await router.isReady()
    const wrapper = mount(App, { 
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.findComponent(NestedRoute).exists()).toBe(true)
  })
})
