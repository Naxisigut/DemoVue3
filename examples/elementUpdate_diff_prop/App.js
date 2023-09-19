import { h, ref } from '../../lib/demo-vue3-esm.js';

// 在component render执行的时候，能够拿到当前组件的element vnode tree，children element vnode，以及children component vnode
// 至于children component的element vnode以及其children，要等到mountChildren时进行遍历patch，才能获取到
export default {
  name: 'App',
  render(){
    const content = h('div', {}, 'content')
    const resetBtn = h('button', {onClick: this.reset}, '恢复初始状态-清空类')
    const redBtn = h('button', {onClick: this.turnRed}, '变为红色')
    const blueBtn = h('button', {onClick: this.turnBlue}, '变为蓝色')
    const clearBtn = h('button', {onClick: this.clear}, '恢复初始状态-类名置空')
    return h('div', {...this.props}, [
      content, 
      resetBtn, 
      redBtn, 
      blueBtn, 
      clearBtn
    ]
  )},
  setup(){
    const props = ref({
      class: ''
    })
    const reset = () => {
      props.value = {}
    }

    const turnBlue = () => props.value.class = 'blue'
    const turnRed = () => props.value.class = 'red'
    const clear = () => props.value.class = undefined

    return{
      props,
      reset,
      turnRed,
      turnBlue,
      clear
    }
  }
}