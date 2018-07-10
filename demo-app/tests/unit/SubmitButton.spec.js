import { shallowMount } from '@vue/test-utils'
import SubmitButton from '@/components/SubmitButton.vue'

describe('SubmitButton.vue', () => {
  describe("リファクタリング前", () => {
    it('権限がない状態のメッセージを表示する', () => {
      const msg = "送信する"
      const wrapper = shallowMount(SubmitButton,{
        propsData: {
          msg: msg
        }
      })

      expect(wrapper.find("span").text()).toBe("権限がありません")
      expect(wrapper.find("button").text()).toBe("送信する")
    })
  
    it('権限がある状態のメッセージを表示する', () => {
      const msg = "送信する"
      const isAdmin = true
      const wrapper = shallowMount(SubmitButton,{
        propsData: {
          msg,
          isAdmin
        }
      })

      expect(wrapper.find("span").text()).toBe("管理者権限を実行する")
      expect(wrapper.find("button").text()).toBe("送信する")
    })
  })



  describe("リファクタリング後", () => {
    const msg = "送信する"
    const factory = (propsData) => {
      return shallowMount(SubmitButton, {
        propsData: {
          msg,
          ...propsData
        }
      })
    }
    const context = describe

    context("管理者あり", ()=> {
      it("メッセージを表示する", () => {
        const wrapper = factory()
  
        expect(wrapper.find("span").text()).toBe("権限がありません")
        expect(wrapper.find("button").text()).toBe("送信する")
      })
    })

    context("管理者なし", ()=> {
      it("メッセージを表示する", () => {
        const wrapper = factory({isAdmin: true})
  
        expect(wrapper.find("span").text()).toBe("管理者権限を実行する")
        expect(wrapper.find("button").text()).toBe("送信する")
      })
    })
  })
})
