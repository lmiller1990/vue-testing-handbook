import { shallowMount } from '@vue/test-utils'
import ColorButton from '@/components/ColorButton.vue'

describe('Greeting.vue', () => {
  it('メッセージを表示する', () => {
    const msg = "Button text"
    const wrapper = shallowMount(ColorButton,{
      propsData: {
        msg: msg
      }
    })

    expect(wrapper.find("span").text()).toBe("権限がありません")
    expect(wrapper.find("button").text()).toBe("Button text")
  })

  it('メッセージを表示する', () => {
    const msg = "Button text"
    const isAdmin = true
    const wrapper = shallowMount(ColorButton,{
      propsData: {
        msg,
        isAdmin
      }
    })

    expect(wrapper.find("span").text()).toBe("管理者権限を実行する")
    expect(wrapper.find("button").text()).toBe("Button text")
  })
})
