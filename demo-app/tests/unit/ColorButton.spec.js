import { mount } from '@vue/test-utils'
import ColorButton from '@/components/ColorButton.vue'

describe('Greeting.vue', () => {
  it('renders a greeting', () => {
    const wrapper = mount(ColorButton)

    console.log(wrapper.html())

    // expect(wrapper.text()).toMatch("Vue and TDD")
  })
})
