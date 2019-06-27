import { shallowMount } from '@vue/test-utils'
import SubmitButton from '@/components/SubmitButton.vue'

const msg = "submit"
const factory = (propsData) => {
  return shallowMount(SubmitButton, {
    propsData: {
      msg,
      ...propsData
    }
  })
}

describe("SubmitButton", () => {
  describe("does not have admin privledges", ()=> {
    it("renders a message", () => {
      const wrapper = factory()

      expect(wrapper.find("span").text()).toBe("Not Authorized")
      expect(wrapper.find("button").text()).toBe("submit")
    })
  })

  describe("has admin privledges", ()=> {
    it("renders a message", () => {
      const wrapper = factory({ isAdmin: true })

      expect(wrapper.find("span").text()).toBe("Admin Privledges")
      expect(wrapper.find("button").text()).toBe("submit")
    })
  })
})
