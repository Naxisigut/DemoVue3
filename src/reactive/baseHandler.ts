import { track, trigger } from './effect';

const createGetter = (isReadOnly: boolean = false) => {
  return function(target, key){
    const res = Reflect.get(target, key)
    if(!isReadOnly){
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
  readonlyGet,
  set(){
    return true
  }
}