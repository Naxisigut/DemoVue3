import { h, getCurrentInstance } from '../../lib/demo-vue3-esm.js';

// 在component render执行的时候，能够拿到当前组件的element vnode tree，children element vnode，以及children component vnode
// 至于children component的element vnode以及其children，要等到mountChildren时进行遍历patch，才能获取到
export default {
  name: 'App',
  render(){
    const app = h('div', {}, this.componentName) 
    return h('div', {}, [app]
  )},
  setup(){
    const instance = getCurrentInstance()
    const componentName = instance.name
    return {
      componentName
    }
  }
}