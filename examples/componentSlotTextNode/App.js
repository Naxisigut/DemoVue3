import { h, createTextVNode } from '../../lib/demo-vue3-esm.js';
import Foo from './foo.js';

// 在component render执行的时候，能够拿到当前组件的element vnode tree，children element vnode，以及children component vnode
// 至于children component的element vnode以及其children，要等到mountChildren时进行遍历patch，才能获取到
export default {
  name: 'App',
  render(){
    // element类型的children vnode
    const app = h('div', {}, 'app') 
    // component类型的children vnode
    console.log(createTextVNode('textnode'));
    const foo = h(Foo, {}, 
      {
        'header': ( scope )=> createTextVNode('textnode'),
        'footer': ( scope )=> h('p', {}, scope.name),
      }
    )
     
    return h('div', {}, [app, foo]
  )},
  setup(){
    return {}
  }
}