import { createVNode } from './vnodes';
import { render } from './renderer';

export function createApp(rootComponent){
  return {
    mount(rootContainer){
      // component => vnodes(component object) => component instance => vnode(element) => real node
      const vnode = createVNode(rootComponent)
      render(vnode, rootContainer)
    }
  }
}
