### Stubbing components

When writing unit tests, often we want to _stub_ parts of the code we are not interested in. A stub is simply a piece of code that stands in for another. For example, let's say you are working on an emailing system. You have a component with three parts:

Talk about

- how to use `stubs` and the different apis:

```
const BMock = {
  name: "B",
  render: h => h("div")
}

const wrapper = shallowMount(Foo, {
  stubs: {
    A: "<div id='a' />",
    B: BMock,
    C: true
  }
})
```

- Talk about why/when to use stubs.
