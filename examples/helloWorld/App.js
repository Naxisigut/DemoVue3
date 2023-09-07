import { h } from '../../lib/demo-vue3-esm.js';
import Foo from './foo.js';

// 在component render执行的时候，能够拿到当前element vnode，children element vnode，以及children component vnode
// 至于children component的element vnode以及其children，要等到mountChildren时进行遍历patch，才能获取到
export default {
  name: 'App',
  render(){
    const app = h('div', {}, 'app') // element类型的vnode
    const foo = h(Foo, {}, h('div', {}, '123')) // component类型的vnode
    return h('div', {}, 
    [
      app, foo
    ]
  )},
  setup(){
    return {}
  }
}