import Vuex from "vuex"
import { shallowMount, createLocalVue } from "@vue/test-utils"
import ComponentWithVuex from "@/components/ComponentWithVuex.vue"
import ComponentWithGetters from "@/components/ComponentWithGetters.vue"

const localVue = createLocalVue()
localVue.use(Vuex)

const store = new Vuex.Store({
  state: {
    username: "alice",
    firstName: "Alice",
    lastName: "Doe"
  },

  getters: {
    fullname: (state) => state.firstName + " " + state.lastName
  }
})

describe("ComponentWithVuex", () => {
  it("renders a username using a real Vuex store", () => {
    const wrapper = shallowMount(ComponentWithVuex, { store, localVue })

    expect(wrapper.find(".username").text()).toBe("alice")
  })

  it("renders a username using a mock store", () => {
    const wrapper = shallowMount(ComponentWithVuex, {
      mocks: {
        $store: {
          state: { username: "alice" }
        }
      }
    })

    expect(wrapper.find(".username").text()).toBe("alice")
  })
})

describe("ComponentWithGetters", () => {
  it("renders a username using a real Vuex getter", () => {
    const wrapper = shallowMount(ComponentWithGetters, { store, localVue })

    expect(wrapper.find(".fullname").text()).toBe("Alice Doe")
  })

  it("renders a username using computed mounting options", () => {
    const wrapper = shallowMount(ComponentWithGetters, {
      mocks: {
        $store: {
          getters: {
            fullname: "Alice Doe"
          }
        }
      }
    })

    expect(wrapper.find(".fullname").text()).toBe("Alice Doe")
  })

  it("renders a username using computed mounting options", () => {
    const wrapper = shallowMount(ComponentWithGetters, {
      computed: {
        fullname: () => "Alice Doe"
      }
    })

    expect(wrapper.find(".fullname").text()).toBe("Alice Doe")
  })
})
