import { h, ref } from '../../lib/demo-vue3-esm.js';
import Text2Arr from './Text2Arr.js';
import Arr2Text from './Arr2Text.js';
import Text2Text from './Text2Text.js';

// 在component render执行的时候，能够拿到当前组件的element vnode tree，children element vnode，以及children component vnode
// 至于children component的element vnode以及其children，要等到mountChildren时进行遍历patch，才能获取到
export default {
  name: 'App',
  render(){
    const changeBtn = h('button', {onClick: this.change}, 'change')
    return h('div', {}, [
      // h(Arr2Text),
      h(Text2Arr),
      // h(Text2Text),
      changeBtn
    ]
  )},
  setup(){
    const change = () => {
      console.log(window.isChange);
      window.isChange.value = true
    }
    return{
      change,
    }
  }
}