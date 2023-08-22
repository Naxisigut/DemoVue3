import { createVNode } from './vnodes';
import { render } from './renderer';

export function createApp(rootComponent){
  return {
    mount(rootContainer){
      // component => vnodes => real nodes
      const vnode = createVNode(rootComponent)

      render(vnode, rootContainer)
    }
  }
}
