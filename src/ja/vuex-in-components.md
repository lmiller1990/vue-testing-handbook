## Testing Vuex in components

- how to mock Vuex

```
const wrapper = shallowMount(Foo, {
  mocks: {
    $store: {
      state: {}
    }
  }
})
```

- Talk about using localVue.use(Vuex) to test

```
localVue.use(Vuex)
const store = new Vuex.Store({})

const wrapper = shallowMount(Foo, {
  store
  localVue
})
```
