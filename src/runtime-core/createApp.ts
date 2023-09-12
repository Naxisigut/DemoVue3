import { createVNode } from './vnodes';
import { createRenderer } from './renderer';

export function createAppApi(option){
  const render = createRenderer(option)
  return function createApp(rootComponent){
    return {
      mount(rootContainer){
        // component => vnodes(component object) => component instance => vnode(element) => real node
        const vnode = createVNode(rootComponent)
        render(vnode, rootContainer)
      }
    }
  }
}
// export function createApp(rootComponent){
//   return {
//     mount(rootContainer){
//       // component => vnodes(component object) => component instance => vnode(element) => real node
//       const vnode = createVNode(rootComponent)
//       render(vnode, rootContainer)
//     }
//   }
// }
