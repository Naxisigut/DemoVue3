import { isObject } from '../shared/index';
import { ShapeFlag } from '../shared/shapeFlag';

export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')

export function createVNode(type, props?, children?){
  const vnode = {
    type, 
    props, 
    shapeFlag: getShapeFlag(type),
    children,
    el: null,
    key: props && props.key
  }

  // question: children为undefined?
  if(typeof children === 'string'){
    vnode.shapeFlag |= ShapeFlag.TEXT_CHILDREN
  }else if(Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlag.ARRAY_CHILDREN
  }else if(isObject(children) && (ShapeFlag.STATEFUL_COMPONENT & vnode.shapeFlag)){
    vnode.shapeFlag |= ShapeFlag.SLOT_CHILDREN
  }

  // console.log(11, vnode);
  return vnode
}

export function createTextVNode(text: string){
  return createVNode(Text, {}, text)
}

function getShapeFlag(type){
  return typeof type === 'string' ? ShapeFlag.ELEMENT : ShapeFlag.STATEFUL_COMPONENT
}


