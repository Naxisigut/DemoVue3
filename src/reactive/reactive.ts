import { 
  mutableHandler, 
  readonlyHandler, 
  shallowReadonlyHandler, 
  // shallowMutableHandler 
} from './baseHandler';

export enum ReactiveFlags{
  IS_REACTIVE = '--v--isReactive',
  IS_READONLY = '--v--isReadonly',
}

function createActiveObject(target, baseHandler){
  return new Proxy(target, baseHandler)
}

export function reactive(target){
  return createActiveObject(target, mutableHandler)
}

// export function shallowReactive(target){
//   return createActiveObject(target, shallowMutableHandler)
// }

export function readonly(target){
  return createActiveObject(target, readonlyHandler)
}

export function shallowReadonly(target){
  return createActiveObject(target, shallowReadonlyHandler)
}

export function isReactive(value){
  return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(value){
  return !!value[ReactiveFlags.IS_READONLY]
}

