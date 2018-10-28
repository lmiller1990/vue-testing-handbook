## Triggering Events

One of the most common things your Vue components will be doing is listening for inputs from the user. `vue-test-utils` and Jest make it easy to test inputs. Let's take a look at how to use `trigger` and Jest mocks to verify our components are working correctly.

The source code for the test described on this page can be found [here](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/FormSubmitter.spec.js).

## Creating the component

We will create a simple form component, `<FormSubmitter>`, that contains an `<input>` and a `<button>`. When the button is clicked, something should happen. The first example will simply reveal a success message, then we will move on to a more interesting example that submits the form to an external endpoint.

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

When the user submits the form, we will reveal a message thanking them for their submission. We want to submit the form asynchronously, so we are using `@submit.prevent` to prevent the default action, which is to refresh the page when the form is submitted.

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

Pretty simple, we just set `submitted` to be `true` when the form is submitted, which in turn reveals the `<div>` containing the success message.

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

We separate each step with a newline as it makes tests more readable.

Run this test with `yarn test:unit`. It should pass.

Trigger is very simple - use `find` to get the element you want to simulate some input, and call `trigger` with the name of the event, and any modifiers.

## A real world example

Forms are usually submitted to some endpoint. Let's see how we might test this component with a different implementation of `handleSubmit`. One common practise is to alias your HTTP library to `Vue.prototype.$http`. This allows us to make an ajax request by simply calling `this.$http.get(...)`. Learn more about this practice [here](https://vuejs.org/v2/cookbook/adding-instance-properties.html). 

Often the http library is, `axios`, a popular HTTP client. In this case, our `handleSubmit` would likely look something like this:

```js
handleSubmitAsync() {
  return this.$http.get("/api/v1/register", { username: this.username })
    .then(() => {
      // show success message, etc
    })
    .catch(() => {
      // handle error
    })
}
```

In this case, one technique is to _mock_ `this.$http` to create the desired testing environment. You can read about the `mocks` mounting option [here](https://vue-test-utils.vuejs.org/api/options.html#mocks). Let's see a mock implemtation of a `http.get` method:

```js
let url = ''
let data = ''

const mockHttp = {
  get: (_url, _data) => {
    return new Promise((resolve, reject) => {
      url = _url
      data = _data
      resolve()
    })
  }
}
```

There are a few interesting things going on here:

- we create a `url` and `data` variable to save the `url` and `data` passed to `$http.get`. This is useful to assert the request is hitting the correct endpoint, with correct payload.
- after assigning the `url` and `data` arguments, we immediately resolve the Promise, to simulate a successful API response.

Before seeing the test, here is the new `handleSubmitAsync` function:

```js
methods: {
  handleSubmitAsync() {
    return this.$http.get("/api/v1/register", { username: this.username })
      .then(() => {
        this.submitted = true
      })
      .catch((e) => {
        throw Error("Something went wrong", e)
      })
  }
}
```

Also, update `<template>` to use the new `handleSubmitAsync` method:

```html
<template>
  <div>
    <form @submit.prevent="handleSubmitAsync">
      <input v-model="username" data-username>
      <input type="submit">
    </form>

  <!-- ... -->
  </div>
</template>
```

Now, only the test.

## Mocking an ajax call

First, include the mock implementation of `this.$http` at the top, before the `describe` block:

```js
let url = ''
let data = ''

const mockHttp = {
  get: (_url, _data) => {
    return new Promise((resolve, reject) => {
      url = _url
      data = _data
      resolve()
    })
  }
}
```

Now, add the test, passing the mock `$http` to the `mocks` mounting option:

```js
it("reveals a notification when submitted", () => {
  const wrapper = shallowMount(FormSubmitter, {
    mocks: {
      $http: mockHttp
    }
  })

  wrapper.find("[data-username]").setValue("alice")
  wrapper.find("form").trigger("submit.prevent")

  expect(wrapper.find(".message").text())
    .toBe("Thank you for your submission, alice.")
})
```

Now, instead of using whatever real http library is attached to `Vue.prototype.$http`, the mock implementation will be used instead. This is good - we can control the environment of the test and get consistent results.

Running `yarn test:unit` actually yields a failing test:

```sh
FAIL  tests/unit/FormSubmitter.spec.js
  ● FormSubmitter › reveals a notification when submitted

    [vue-test-utils]: find did not return .message, cannot call text() on empty Wrapper
```

What is happening is that the test is finishing _before_ the promise returned by `mockHttp` resolves. We can make the test async like this:

```js
it("reveals a notification when submitted", async () => {
  // ...
})
```

However, the test will still finish before the promise resolves. One way to work around this is to use [flush-promises](https://www.npmjs.com/package/flush-promises), a simple Node.js module that will immediately resolve all pending promises. Install it with `yarn add flush-promises`, and update the test as follows:

```js
import flushPromises from "flush-promises"
// ...

it("reveals a notification when submitted", async () => {
  const wrapper = shallowMount(FormSubmitter, {
    mocks: {
      $http: mockHttp
    }
  })

  wrapper.find("[data-username]").setValue("alice")
  wrapper.find("form").trigger("submit.prevent")

  await flushPromises()

  expect(wrapper.find(".message").text())
    .toBe("Thank you for your submission, alice.")
})
```

Now the test passes. The source code for `flush-promises` is only about 10 lines long, if you are interested in Node.js it is worth reading and understanding how it works.

We should also make sure the endpoint and payload are correct. Add two more assertions to the test:

```js
// ...
expect(url).toBe("/api/v1/register")
expect(data).toEqual({ username: "alice" })
```

The test still passes.

## Conclusion

In this section, we saw how to:

- use `trigger` on events, even ones that use modifiers like `prevent`
- use `setValue` to set a value of an `<input>` using `v-model`
- write tests using the three steps of unit testing
- mock a method attached to `Vue.prototype` using the `mocks` mounting option
- how to use `flush-promises` to immediately resolve all promises, a useful technique in unit testing

The source code for the test described on this page can be found [here](https://github.com/lmiller1990/vue-testing-handbook/tree/master/demo-app/tests/unit/FormSubmitter.spec.js).
