## Testing Mutations

Talk about testing mutations. Similar to `vuex-actions`.

```
// store.js
export const mutations = {
  MY_MUTATION (state, ...) {
  }
}
```

```
// store.test.js
import { mutations } from './store'

describe('mutations', () => {
  it('...', () => {
    const state = {}
    
    mutations.MY_MUTATION(state, ...)

    expect(state.foo).toBe(bar)
  })
})
```
