module.exports = {
  base: "/vue-testing-handbook/",
  title: "Vue testing handbook",
  ga: "UA-122389064-1",
  locales: {
    '/': {
      lang: 'en-US',
      title: 'Vue testing handbook',
    },
    '/ja/': {
      lang: 'ja-JP',
      title: 'Vueテストハンドブック',
    }
  },
  themeConfig: {
    locales: {
      '/': {
        sidebar: [
          ['/', 'Welcome'],
          ['/setting-up-for-tdd', 'Setting up for TDD'],
          ['/rendering-a-component', 'Rendering Components'],
          ['/components-with-props', 'Testing Props'],
          ['/computed-properties', 'Computed Properties'],
          ['/simulating-user-input', 'Simulating user input'],
          ['/testing-emitted-events', 'Testing emitted events'],
          ['/mocking-global-objects', 'Mocking global objects'],
          ['/stubbing-components', 'Stubbing components'],
          ['/finding-elements-and-components', 'Finding elements and components'],
          ['/testing-vuex', 'Testing Vuex'],
          ['/vuex-mutations', 'Vuex - Mutations'],
          ['/vuex-actions', 'Vuex - Actions'],
          ['/vuex-getters', 'Vuex - Getters'],
          ['/vuex-in-components', 'Vuex in components - $state and getters'],
          ['/vuex-in-components-mutations-and-actions', 'Vuex in components - mutations and actions'],
          ['/jest-mocking-modules', 'Jest - mocking modules'],
          ['/vue-router', 'Vue Router'],
        ]
      },
      '/ja/': {
        sidebar: [
          ['/ja/', 'ようこそ'],
          ['/ja/setting-up-for-tdd', 'テスト駆動開発環境を準備'],
          ['/ja/rendering-a-component', 'コンポーネントをレンダー'],
          ['/ja/components-with-props', 'プロップスのテスト'],
          ['/ja/computed-properties', '算出プロパティ'],
          ['/ja/simulating-user-input', 'ユーザー入力をシミュレーション'],
          ['/ja/testing-emitted-events', '発生してイベントのテスト'],
          ['/ja/mocking-global-objects', 'グローバルオブジェクトのモック'],
          ['/ja/stubbing-components', 'コンポーネントをスタブする'],
          ['/ja/finding-elements-and-components', '要素とコンポーネントを検索する'],
          ['/ja/testing-vuex', 'Vuexのテストの紹介'],
          ['/ja/vuex-mutations', 'Vuex - ミューテーション'],
          ['/ja/vuex-actions', 'Vuex - アクション'],
          ['/ja/vuex-getters', 'Vuex - ゲッター'],
          ['/ja/vuex-in-components', 'コンポーネントの中でVuexのテスト'],
          ['/ja/vuex-in-components-mutations-and-actions.md', 'Vuex in components - mutations and actions'],
          ['/ja/jest-mocking-modules', 'Jestでモジュールをモック'],
          ['/ja/vue-router', 'Vueルーター'],                 
        ]
      }
    }
  },
  markdown: {
    config: md => {
      // use more markdown-it plugins!
      md.use(require('markdown-it-include'))
    }
  }
}
