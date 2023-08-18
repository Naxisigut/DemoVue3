/* proxy的get/set */

import { isObject, extend } from '../shared';
import { track, trigger } from './effect';
import { reactive, ReactiveFlags, readonly } from './reactive';

const createGetter = (isReadonly: boolean = false, isShallow: boolean = false) => {
  return function(target, key){
    if(key === ReactiveFlags.IS_REACTIVE){
      return !isReadonly
    }else if(key === ReactiveFlags.IS_READONLY){
      return isReadonly
    }

    const res = Reflect.get(target, key)
    if(!isReadonly){
      track(target, key)
    }
    if(isObject(res) && !isShallow){
      return isReadonly ? readonly(res) : reactive(res)
    }
    return res
  }
}

const createSetter = () =>{
  return function(target, key, value){
    const res = Reflect.set(target, key, value)
    trigger(target, key)

    return res
  }
}

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)
// const shallowMutableGet = createGetter(false, true)

export const mutableHandler = {
  get,
  set
}

export const readonlyHandler = {
  get: readonlyGet,
  set(target, key, newVal){
    console.warn(`error: key ${key} 写入失败，因为target为readonly`)
    return true
  }
}

export const shallowReadonlyHandler = extend({}, readonlyHandler, { get: shallowReadonlyGet})
// export const shallowMutableHandler = extend({}, mutableHandler, { get: shallowMutableGet })