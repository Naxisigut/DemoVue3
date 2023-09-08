import { h, renderSlots } from '../../lib/demo-vue3-esm.js';

export default {
  name: 'foo',
  render(){
    const foo = h('div', {}, 'foo')
    console.log('this.$slots', this.$slots); // $slots 返回父组件向子组件传入的slots
    // 具名插槽：
    // 1. 获取插槽内容
    // 2. 确定插槽位置
    // 作用域插槽：
    // 1. 传入子组件的变量
    const headerScope = { name: 'foo header scope' }
    const footerScope = { name: 'foo footer scope' }
    const header = renderSlots(this.$slots, 'header', headerScope)
    const footer = renderSlots(this.$slots, 'footer', footerScope)
    return h('div', 
      {},
      [
        header,
        foo, 
        footer
      ]
    )
  },
  setup(){
    return {
    }
  },
}