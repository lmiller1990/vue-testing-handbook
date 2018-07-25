## Stubbing components

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
