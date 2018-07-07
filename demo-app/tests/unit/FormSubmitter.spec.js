import { shallowMount } from "@vue/test-utils"
import FormSubmitter from "@/components/FormSubmitter.vue"

let url = ''
let data = ''

const mockHttp = {
  get: (_url, _data) => {
    return new Promise((resolve, reject) => {
      url = _url
      data = _data
      resolve()
    })
  }
}

describe("FormSubmitter", () => {
  xit("reveals a notification when submitted", () => {
    const wrapper = shallowMount(FormSubmitter)

    wrapper.find("[data-username]").setValue("alice")
    wrapper.find("form").trigger("submit.prevent")

    expect(wrapper.find(".message").text())
      .toBe("Thank you for your submission, alice.")
  })

  it("reveals a notification when submitted", () => {
    const wrapper = shallowMount(FormSubmitter, {
      mocks: {
        $http: mockHttp
      }
    })

    wrapper.find("[data-username]").setValue("alice")
    wrapper.find("form").trigger("submit.prevent")

    expect(wrapper.find(".message").text())
      .toBe("Thank you for your submission, alice.")
  })
})
