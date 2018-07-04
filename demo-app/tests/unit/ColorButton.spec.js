import { shallowMount } from '@vue/test-utils'
import ColorButton from '@/components/ColorButton.vue'

describe('Greeting.vue', () => {
  it('renders a msg', () => {
    const wrapper = shallowMount(ColorButton,{
      propsData: {
        msg: "Button text"
      }
    })

    expect(wrapper.find("button").text()).toBe("Button text")
  })

  it('renders a text with color', () => {
    const msg = "Button text"
    const wrapper = shallowMount(ColorButton,{
      propsData: {
        msg
      }
    })

    console.log(wrapper.html())

    // expect(wrapper.find("button")).toBe(msg)
  })
})
