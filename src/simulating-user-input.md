### Triggering Events

One of the most common things your Vue components will be doing in listening for inputs from the user. `vue-test-utils` and Jest make it easy to test inputs. Let's take a look at how to use `trigger` and Jest mocks to verify our components are working correctly.

## Creating the component

We will create a simple form component, `<FormSubmitter>`, that contains a `<input>` and a `<button>`. When the button is clicked, something should happen. The first example will simply reveal a success message, then we will move on to a more interesting example that submits the form to an external endpoint.

Create a `<FormSubmitter>` and enter the template:

```html
<template>
  <div>
    <form @submit.prevent="handleSubmit">
      <input v-model="username" data-username>
      <input type="submit">
    </form>

    <div 
      class="message" 
      v-show="submitted"
    >
      Thank you for your submission, {{ username }}.
    </div>
  </div>
</template>
```

When the user submits the form, we will reveal a message thanking them for their submission. We want submit the form asynchronously, so we are using `@submit.prevent` to prevent the default action, which it to refresh the page when the form is submitted.

Now add the form submission logic:

```html
<script>
  export default {
    name: "FormSubmitter",

    data() {
      return {
        username: '',
        submitted: false
      }
    },

    methods: {
      handleSubmit() {
        this.submitted = true
      }
    }
  }
</script>
```

Pretty simple, we just set `submitted` to be `true` when the form is submitted. 

## Writing the test

Let's see a test:

```js
import { shallowMount } from "@vue/test-utils"
import FormSubmitter from "@/components/FormSubmitter.vue"

describe("FormSubmitter", () => {
  it("reveals a notification when submitted", () => {
    const wrapper = shallowMount(FormSubmitter)

    wrapper.find("[data-username]").setValue("alice")
    wrapper.find("form").trigger("submit.prevent")

    expect(wrapper.find(".message").text())
      .toBe("Thank you for your submission, alice.")
  })
})
```

This test is fairly self explanatory. We `shallowMount` the component, set the username and use the `trigger` method `vue-test-utils` provides to simulate user input. `trigger` works on custom events, as well as events that use modifiers, like `submit.prevent`, `keydown.enter`, and so on.

This test also follows the three steps of unit testing:

1. arrange (set up for the test. In our case, we render the component).
2. act (execute actions on the system)
3. assert (ensure the actual result matches your expectations)

I like to separate each step with a newline. I think it makes tests more readable.

Run this test with `yarn test:unit`. It should pass.

Trigger is very simple - use `find` to get the element you want to simulate some input, and call `trigger` with the name of the event, and any modifiers.

## A real world example

Forms are usually submitted to some endpoint. Let's see how we might test this component with a different implementation of `handleSubmit`. One common practise is to alias your HTTP library to `Vue.prototype.$http`. Often this is `axios`, a popular HTTP client. In this case, `handleSubmit` would likely look something like this:

```js
handleSubmit() {
  return this.$http.get("/api/v1/register", { username: this.username })
    .then(() => {
      this.submitted = true
    })
    .catch(() => {
      throw Error("Something went wrong")
    })
}
```
