import { shallowMount } from '@vue/test-utils'
import ColorButton from '@/components/ColorButton.vue'

describe('Greeting.vue', () => {
  it('renders a msg', () => {
    const wrapper = shallowMount(ColorButton,{
      propsData: {
        msg: "Button text"
      }
    })

    console.log(wrapper.html())

    expect(wrapper.find("button").text()).toBe("Button text")
  })
})
