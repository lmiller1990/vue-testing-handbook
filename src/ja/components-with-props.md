## Components with props

Talk about

- how to use `propsData` to pass props

```js
const wrapper = shallowMount(Foo, {
  propsData: {
    foo: 'bar'
  }
})
```

- how to use factory functions to not have to type `propsData` over and over again

### Bad

```
const wrapper = shallowMount(Foo, {
  propsData: {
    foo: "bar",
    qux: "hoge",
    ...
  }
})

const wrapper = shallowMount(Foo, {
  propsData: {
    foo: "bar"
    qux: "hoge"
    ...
  }
})
```

### Good

```
const factory = (propsData) => {
  return shallowMount(Component, {
    propsData: {
      foo: "bar",
      ...propsData
    }
  })
}
```

