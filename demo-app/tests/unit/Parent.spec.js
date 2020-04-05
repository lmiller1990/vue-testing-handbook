import { mount } from "@vue/test-utils"
import Parent from "@/components/Parent.vue"
import ParentWithManyChildren from "@/components/ParentWithManyChildren.vue"
import Child from "@/components/Child.vue"

describe("Parent", () => {
  it("does not render a span", () => {
    const wrapper = mount(Parent)

    expect(wrapper.find("span").isVisible()).toBe(false)
  })

  it("does render a span", () => {
    const wrapper = mount(Parent, {
      data() {
        return { showSpan: true }
      }
    })

    expect(wrapper.find("span").isVisible()).toBe(true)
  })

  it("does not render a Child component", () => {
    const wrapper = mount(Parent)

    expect(wrapper.find(Child).exists()).toBe(false)
  })

  it("renders a Child component", () => {
    const wrapper = mount(Parent, {
      data() {
        return { showChild: true }
      }
    })

    expect(wrapper.find({ name: "Child" }).exists()).toBe(true)
  })
})

describe("ParentWithManyChildren", () => {
  it("renders many children", () => {
    const wrapper = mount(ParentWithManyChildren)

    expect(wrapper.findAll(Child).length).toBe(3)
  })
})
