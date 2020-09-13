import getters from "../../src/store/getters.js"

const dogs = [
  { name: "lucky", breed: "poodle", age: 1 },
  { name: "pochy", breed: "dalmatian", age: 2 },
  { name: "blackie", breed: "poodle", age: 4 }
]
const state = { dogs }

describe("poodles", () => {
  it("returns poodles", () => {
    const actual = getters.poodles(state)

    expect(actual).toEqual([ dogs[0], dogs[2] ])
  })
})

describe("poodlesByAge", () => {
  it("returns poodles by age", () => {
    const poodles = [ dogs[0], dogs[2] ]
    const actual = getters.poodlesByAge(state, { poodles })(1)

    expect(actual).toEqual([ dogs[0] ])
  })
})
