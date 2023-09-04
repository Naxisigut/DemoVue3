import { ShapeFlag } from '../shared/shapeFlag';

export function createVNode(type, props?, children?){
  const vnode = {
    type, 
    props, 
    shapeFlag: getShapeFlag(type),
    children,
    el: null,
  }

  // question: children为undefined?
  if(typeof children === 'string'){
    vnode.shapeFlag |= ShapeFlag.TEXT_CHILDREN
  }else if(Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlag.ARRAY_CHILDREN
  }

  // console.log(11, vnode);
  return vnode
}

function getShapeFlag(type){
  return typeof type === 'string' ? ShapeFlag.ELEMENT : ShapeFlag.STATEFUL_COMPONENT
}


