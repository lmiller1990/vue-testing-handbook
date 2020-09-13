import { createStore } from "vuex"
import { mount } from "@vue/test-utils"
import ComponentWithVuex from "../../src/components/ComponentWithVuex.vue"
import ComponentWithGetters from "../../src/components/ComponentWithGetters.vue"

const store = createStore({
  state() {
    return {
      username: "alice",
      firstName: "Alice",
      lastName: "Doe"
    }
  },

  getters: {
    fullname: (state) => state.firstName + " " + state.lastName
  }
})

describe("ComponentWithVuex", () => {
  it("renders a username using a real Vuex store", () => {
    const wrapper = mount(ComponentWithVuex, {
      global: {
        plugins: [store]
      }
    })

    expect(wrapper.find(".username").text()).toBe("alice")
  })

  it("renders a username using a mock store", () => {
    const wrapper = mount(ComponentWithVuex, {
      global: {
        mocks: {
          $store: {
            state: { username: "alice" }
          }
        }
      }
    })

    expect(wrapper.find(".username").text()).toBe("alice")
  })
})

describe("ComponentWithGetters", () => {
  it("renders a username using a real Vuex getter", () => {
    const wrapper = mount(ComponentWithGetters, {
      global: {
        plugins: [store]
      }
    })

    expect(wrapper.find(".fullname").text()).toBe("Alice Doe")
  })

  it("renders a username using computed mounting options", () => {
    const wrapper = mount(ComponentWithGetters, {
      global: {
        mocks: {
          $store: {
            getters: {
              fullname: "Alice Doe"
            }
          }
        }
      }
    })

    expect(wrapper.find(".fullname").text()).toBe("Alice Doe")
  })
})
