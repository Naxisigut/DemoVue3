import { isObject } from '../shared/index';
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

function createReactiveObject(target, baseHandler){
  if(!isObject(target)){
    console.warn(`${target}必须是一个对象！`)
    return target
  }
  return new Proxy(target, baseHandler)
}

export function reactive(target){
  return createReactiveObject(target, mutableHandler)
}

// export function shallowReactive(target){
//   return createReactiveObject(target, shallowMutableHandler)
// }

export function readonly(target){
  return createReactiveObject(target, readonlyHandler)
}

export function shallowReadonly(target){
  return createReactiveObject(target, shallowReadonlyHandler)
}

export function isReactive(value){
  return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(value){
  return !!value[ReactiveFlags.IS_READONLY]
}

export function isProxy(value){
  return isReactive(value) || isReadonly(value)
}

