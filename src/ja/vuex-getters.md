## Testing getters

Talk about testing getters outside of Vuex

```
// store

export const getters = {
  getUsers: (state) => (ids) => {
    return state.users.filter(x => ids.includes(x))
  }
}


// test

test('test getters', () => {
  const state = {
    const id = 1
    users: [{ id: 1 ... }]
  }

  const actual = getUsers(state)(id)

  expect(actual).toBe(...)
})
```
