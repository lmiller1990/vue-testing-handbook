import { shallowMount, mount } from '@vue/test-utils'
import ParentWithAPICallChild from '@/components/ParentWithAPICallChild.vue'

describe('ParentWithAPICallChild.vue', () => {
  it('renders with mount and does initialize API call', () => {
    const wrapper = mount(ParentWithAPICallChild)
  })

  it('renders with shallowMount and does not initialize API call', () => {
    const wrapper = shallowMount(ParentWithAPICallChild)
  })
})
