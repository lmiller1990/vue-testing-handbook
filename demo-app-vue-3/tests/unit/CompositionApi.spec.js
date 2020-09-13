import { shallowMount } from "@vue/test-utils"

import CompositionApi from "../../src/components/CompositionApi.vue"

describe("CompositionApi", () => {
  it("increments a count when button is clicked", async () => {
    const wrapper = shallowMount(CompositionApi, {
      props: { message: '' }
    })

    wrapper.find('button').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find(".count").text()).toBe("Count: 1")
  })

  it("renders a message", async () => {
    const wrapper = shallowMount(CompositionApi, {
      props: {
        message: "Testing the composition API"
      }
    })

    expect(wrapper.find(".message").text()).toBe("TESTING THE COMPOSITION API")
  })
})
