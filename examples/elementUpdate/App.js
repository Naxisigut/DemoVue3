import { h, ref } from '../../lib/demo-vue3-esm.js';

// 在component render执行的时候，能够拿到当前组件的element vnode tree，children element vnode，以及children component vnode
// 至于children component的element vnode以及其children，要等到mountChildren时进行遍历patch，才能获取到
export default {
  name: 'App',
  render(){
    return h('div', {}, [
      h('div', {}, 'count:' + this.count),
      h('button', {
        onClick: this.onClick
      }, 'count++')
    ]
  )},
  setup(){
    const count = ref(0)
    const onClick = () => {
      count.value++
    }

    return{
      count,
      onClick
    }
  }
}