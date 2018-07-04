(window.webpackJsonp=window.webpackJsonp||[]).push([[2],{153:function(t,e,s){"use strict";s.r(e);var n=s(0),a=Object(n.a)({},function(){this.$createElement;this._self._c;return this._m(0)},[function(){var t=this.$createElement,e=this._self._c||t;return e("div",{staticClass:"content"},[e("h3",{attrs:{id:"testing-getters"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#testing-getters","aria-hidden":"true"}},[this._v("#")]),this._v(" Testing getters")]),e("p",[this._v("Talk about testing getters outside of Vuex")]),e("div",{staticClass:"language- extra-class"},[e("pre",{pre:!0,attrs:{class:"language-text"}},[e("code",[this._v("// store\n\nexport const getters = {\n  getUsers: (state) => (ids) => {\n    return state.users.filter(x => ids.includes(x))\n  }\n}\n\n\n// test\n\ntest('test getters', () => {\n  const state = {\n    const id = 1\n    users: [{ id: 1 ... }]\n  }\n\n  const actual = getUsers(state)(id)\n\n  expect(actual).toBe(...)\n})\n")])])])])}],!1,null,null,null);e.default=a.exports}}]);