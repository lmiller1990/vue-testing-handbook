import actions from "@/store/actions.js"

/*
let url = ''
let body = {}

jest.mock("axios", () => {
  return {
    post: (_url, _body) => { 
      url = _url
      body = _body
    }
  }
})
*/
let url = ""
describe("authenticate", () => {
  it("authenticated a user", async () => {
    const commit = jest.fn()
    const username = "alice"
    const password = "password"

    await actions.authenticate({ commit }, { username, password })

    expect(url).toBe("/api/authenticate")
    expect(commit).toHaveBeenCalledWith(
      "SET_AUTHENTICATED", { username, password })
  })
})
