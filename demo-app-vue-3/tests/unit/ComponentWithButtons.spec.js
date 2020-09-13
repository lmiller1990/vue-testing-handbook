import Vuex from "vuex"
import { createLocalVue, mount } from "@vue/test-utils"
import ComponentWithButtons from "../../src/components/ComponentWithButtons.vue"

const localVue = createLocalVue()
localVue.use(Vuex)

const mutations = {
  testMutation: jest.fn()
}

const store = new Vuex.Store({
  mutations,
})

describe("ComponentWithButtons", () => {

  it("commits a mutation when a button is clicked", async () => {
    const wrapper = mount(ComponentWithButtons, {
      store, localVue
    })

    wrapper.find(".commit").trigger("click")
    await wrapper.vm.$nextTick()    

    expect(mutations.testMutation).toHaveBeenCalledWith(
      {},
      { msg: "Test Commit" }
    )
  })

  it("dispatch a namespaced action when button is clicked", async () => {
    const store = new Vuex.Store()
    store.dispatch = jest.fn()

    const wrapper = mount(ComponentWithButtons, {
      store, localVue
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
      mocks: {
        $store: mockStore 
      }
    })

    wrapper.find(".dispatch").trigger("click")
    await wrapper.vm.$nextTick()
    
    expect(mockStore.dispatch).toHaveBeenCalledWith(
      "testAction" , { msg: "Test Dispatch" })
  })

})
