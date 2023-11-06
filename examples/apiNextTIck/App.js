import { h, ref, nextTick } from '../../lib/demo-vue3-esm.js';

// 在component render执行的时候，能够拿到当前组件的element vnode tree，children element vnode，以及children component vnode
// 至于children component的element vnode以及其children，要等到mountChildren时进行遍历patch，才能获取到
export default {
  name: 'App',
  render(){
    const btn = h('button', {
      onClick: this.onClick
    }, '执行')

    nextTick(() => {
    })
    return h('div', {}, [
      btn,
      h('div', {}, `${this.count}`)
    ])
  },
  setup(){
    let count = ref(0)
    const onClick = function(){
      for (let index = 0; index < 10; index++) {
        count.value = index        
      }
    }
    return {
      onClick,
      count
    }
  }
}