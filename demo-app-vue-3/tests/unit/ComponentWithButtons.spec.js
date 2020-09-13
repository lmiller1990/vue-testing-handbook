import { createStore } from "vuex"
import { mount } from "@vue/test-utils"
import ComponentWithButtons from "../../src/components/ComponentWithButtons.vue"

const mutations = {
  testMutation: jest.fn()
}

const store = createStore({
  mutations
})

describe("ComponentWithButtons", () => {

  it("commits a mutation when a button is clicked", async () => {
    const wrapper = mount(ComponentWithButtons, {
      global: {
        plugins: [store]
      }
    })

    wrapper.find(".commit").trigger("click")
    await wrapper.vm.$nextTick()    

    expect(mutations.testMutation).toHaveBeenCalledWith(
      {},
      { msg: "Test Commit" }
    )
  })

  it("dispatch a namespaced action when button is clicked", async () => {
    const store = createStore()
    store.dispatch = jest.fn()

    const wrapper = mount(ComponentWithButtons, {
      global: {
        plugins: [store]
      }
    })

    wrapper.find(".namespaced-dispatch").trigger("click")
    await wrapper.vm.$nextTick()

    expect(store.dispatch).toHaveBeenCalledWith(
      'namespaced/very/deeply/testAction',
      { msg: "Test Namespaced Dispatch" }
    )
  })


  it("dispatches an action when a button is clicked", async () => {
    const mockStore = { dispatch: jest.fn() }
    const wrapper = mount(ComponentWithButtons, {
      global: {
        mocks: {
          $store: mockStore 
        }
      }
    })

    wrapper.find(".dispatch").trigger("click")
    await wrapper.vm.$nextTick()
    
    expect(mockStore.dispatch).toHaveBeenCalledWith(
      "testAction" , { msg: "Test Dispatch" })
  })

})
