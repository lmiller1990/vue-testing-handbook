asdf
## Vuex のテスト

これ以降しばらくは、Vuex のテストについて解説していきます。

The next few guides discuss testing Vuex.

## Vuex のテストにおける二つの側面

一般的にいってコンポーネントは Vuex と以下の方法でやりとりをしています。

Generally components will interact with Vuex by

1. mutation へ commit する
2. action を dispatching する
3. `$store.state` もしくは getters 用いて state にアクセスする

1. committing a mutation
2. dispatching an action
3. acesss the state via `$store.state` or getters

コンポーネントについてのテストを書く場合には、コンポーネントが Vuex store の現在の state に基づいて正しく動作していてることを assert すればいいわけです。ですから mutation や action や getter がどのように実装されているかを知る必要はありません。(訳注: コンポーネントのテストを書く際に、mutation 等々のテストを含める必要はないということ。)

These tests are to assert that the component behaves correctly based on the current state of the Vuex store. They do not need to know about the implmentation of the mutators, actions or getters.

それにたいして、store が遂行するロジック、例えば mutation や getter に関しては、それ自体を単独でテストをすることができます。なぜなら Vuex の store は通常の JavaScript の関数によって構成されているからで、それゆえユニットテスをするのも簡単です。

Any logic performed by the store, such as mutations and getters, can be tested in isolation. Since Vuex stores are comprised of regular JavaScript functions, they are easily unit tested.

まずは Vuex 単独のテストについて説明していきます。後半では、Vuex store を使ったコンポーネントのテスト技法を取り上げます。

The next guide introduces some techniques to test components that use a Vuex store, and ensure they behave correctly based on the store's state. Later guides discuss testing Vuex in isolation.
