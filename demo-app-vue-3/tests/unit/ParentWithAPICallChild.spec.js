import { shallowMount, mount } from '@vue/test-utils';
import ParentWithAPICallChild from '../../src/components/ParentWithAPICallChild.vue';
import ComponentWithAsyncCall from '../../src/components/ComponentWithAsyncCall.vue';

describe('ParentWithAPICallChild.vue', () => {
  it('renders with mount and does initialize API call', () => {
    const wrapper = mount(ParentWithAPICallChild, {
      global: {
        stubs: {
          ComponentWithAsyncCall: true,
        },
      },
    });

    expect(wrapper.findComponent(ComponentWithAsyncCall).exists()).toBe(true);
  });

  it('renders with shallowMount and does not initialize API call', () => {
    const wrapper = shallowMount(ParentWithAPICallChild);

    expect(wrapper.findComponent(ComponentWithAsyncCall).exists()).toBe(true);
  });
});
