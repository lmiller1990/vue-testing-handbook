import actions from "@/store/actions.js"

import axios from "axios"

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

describe("authenticate", () => {
  it("authenticated a user", async () => {
    const commit = jest.fn()
    const username = "alice"
    const password = "password"

    await actions.authenticate({ commit }, { username, password })

    expect(url).toBe("/api/authenticate")
    expect(body).toEqual({ username, password })
  })
})
