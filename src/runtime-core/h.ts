import { createVNode } from './vnodes';

export function h(type, props?, children?){
  return createVNode(type, props, children)
}