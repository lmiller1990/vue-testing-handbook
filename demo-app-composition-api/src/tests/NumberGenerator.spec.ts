import { mount } from '@vue/test-utils';
import NumberRender from '../components/NumberRender.vue';

const wrapper = mount(NumberRender, {
  props: {
    even: true,
  },
});

describe('NumberRenderer', () => {
  it('renders even numbers', () => {
    expect(wrapper.text()).toBe('2, 4, 6, 8, 10');
  } );

  it('renders odd numbers', () => {
    const localThis = { even: false };
    if (NumberRender.computed) {
      expect(NumberRender.computed.numbers.call(localThis)).toBe(
        '1, 3, 5, 7, 9',
      );
    }
  });
});
