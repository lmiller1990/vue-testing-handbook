import { shallowMount } from '@vue/test-utils'
import SubmitButton from '../../src/components/SubmitButton.vue'

const msg = "submit"
const factory = (props) => {
  return shallowMount(SubmitButton, {
    props: {
      msg,
      ...props
    }
  })
}

describe("SubmitButton", () => {
  describe("does not have admin privileges", ()=> {
    it("renders a message", () => {
      const wrapper = factory()

      expect(wrapper.find("span").text()).toBe("Not Authorized")
      expect(wrapper.find("button").text()).toBe("submit")
    })
  })

  describe("has admin privileges", ()=> {
    it("renders a message", () => {
      const wrapper = factory({ isAdmin: true })

      expect(wrapper.find("span").text()).toBe("Admin Privileges")
      expect(wrapper.find("button").text()).toBe("submit")
    })
  })
})
