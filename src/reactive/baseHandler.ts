/* proxy的get/set */

import { track, trigger } from './effect';
import { ReactiveFlags } from './reactive';

const createGetter = (isReadonly: boolean = false) => {
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

export const mutableHandler = {
  get,
  set
}

export const readonlyHandler = {
  get: readonlyGet,
  set(){
    return true
  }
}