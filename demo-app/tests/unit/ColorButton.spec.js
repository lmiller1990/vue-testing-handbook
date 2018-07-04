import { mount } from '@vue/test-utils'
import ColorButton from '@/components/ColorButton.vue'

describe('Greeting.vue', () => {
  it('renders a greeting', () => {
    const wrapper = mount(ColorButton,{
      propsData: {
        msg: "Button text"
      }
    })

    console.log(wrapper.html())
  })
})
