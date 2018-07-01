module.exports = {
  title: "Vue testing handbook",
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
          ['/rendering-a-component', 'Getting Started'],
          ['/setting-up-for-tdd', 'Setting up for TDD'],
          ['/components-with-props', 'Testing Props'],
        ]
      },
      '/ja/': {
        sidebar: [
          ['/ja/', 'ようこそ'],
          ['/ja/rendering-a-component', '初めから'],
          ['/ja/setting-up-for-tdd', 'テスト駆動開発環境を準備'],
          ['/ja/components-with-props', 'プロップスのテスト']
        ]
      }
    }
  }
}
