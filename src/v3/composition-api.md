## The Composition API

Vue 3 will introduce a new API for create components - the [Composition API](https://vue-composition-api-rfc.netlify.com/#basic-example). To allow users to try it out and get feedback, the Vue team released a plugin that lets us try it out in Vue 2. You can find it [here](https://github.com/vuejs/composition-api).

Testing a component build with the Composition API should be no different to testing a standard component, since we are not testing the implementation, but the output (*what* the component does, not *how* it does it). This article will show a simple example of a component using the Composition API in Vue 2, and how testing strategies are the same as any other component.

The source code for the test described on this page can be found [here](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/CompositionApi.spec.js).

## The Component

Below the "Hello, World" of the Composition API, more or less. If you don't understand something, [read the RFC](https://vue-composition-api-rfc.netlify.com/) or have a Google; there are lots of resources about the Composition API.

```html
<template>
  <div>
    <div class="message">{{ uppercasedMessage }}</div>
    <div class="count">
      Count: {{ state.count }}
    </div>
    <button @click="increment">Increment</button>
  </div>
</template>

<script>
import Vue from 'vue'
import VueCompositionApi from '@vue/composition-api'

Vue.use(VueCompositionApi)

import { 
  reactive,
  computed
} from '@vue/composition-api'

export default {
  name: 'CompositionApi',

  props: {
    message: {
      type: String
    }
  },

  setup(props) {
    const state = reactive({
      count: 0
    })

    const increment = () => {
      state.count += 1
    }

    return {
      state,
      increment,
      uppercasedMessage: computed(() => props.message.toUpperCase())
    }
  }
}
</script>
```

The two things we will need to test here are:

1. Does clicking the increment button increase `state.count` by 1?

2. Does the message received in the props render correctly (transformed to upper case)?

## Testing the Props Message

Testing the message is correctly rendered is trivial. We just use `propsData` to set the value of the prop, as described [here](/components-with-props.html).

```js
import { mount } from "@vue/test-utils"

import CompositionApi from "@/components/CompositionApi.vue"

describe("CompositionApi", () => {
  it("renders a message", () => {
    const wrapper = mount(CompositionApi, {
      propsData: {
        message: "Testing the composition API"
      }
    })

    expect(wrapper.find(".message").text()).toBe("TESTING THE COMPOSITION API")
  })
})
```

As expected, this is very simple - regardless of the way we are composing out components, we use the same API and same strategies to test. You should be able to change the implementation entirely, and not need to touch the tests. Remember to test outputs (the rendered HTML, usually) based on given inputs (props, triggered events), not the implementation.

## Testing the Button Click

Writing a test to ensure clicking the button increments the `state.count` is equally simple. Notice the test is marked `async`; read more about why this is required in [Simulating User Input](simulating-user-input.html#writing-the-test).

```js
import { mount } from "@vue/test-utils"

import CompositionApi from "@/components/CompositionApi.vue"

describe("CompositionApi", () => {
  it("increments a count when button is clicked", async () => {
    const wrapper = mount(CompositionApi, {
      propsData: { message: '' }
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.find(".count").text()).toBe("Count: 1")
  })
})
```

Again, entirely uninteresting - we `trigger` the click event, and assert that the rendered `count` increased.

## Conclusion

The article demonstrates how testing a component using the Composition API is identical to testing one using the traditional options API. The ideas and concepts are the same. The main point to be learned is when writing tests, make asserions based on inputs and outputs. 

It should be possible to refactor any traditional Vue component to use the Composition API without the need to change the unit tests. If you find yourself needing to change your tests when refactoring, you are likely testing the *implmentation*, not the output. 

While an exciting new feature, the Composition API is entirely additive, so there is no immediate need to use it, however regardless of your choice, remember a good unit tests asserts the final state of the component, without considering the implementation details.
