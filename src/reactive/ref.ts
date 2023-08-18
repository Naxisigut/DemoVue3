import { isEqual, isObject } from '../shared';
import { trackEffect, triggerEffect, isTracking } from './effect';
import { reactive } from './reactive';
import { ReactiveFlags } from './enum';

class RefImpl{
  private _value: any
  private _rawValue: any // 所代理的原始对象/值
  public deps: any
  public __v__isRef = true
  constructor(value){
    // 对于对象，需要返回一个reactive代理对象
    this._value = convert(value)
    this._rawValue = value
    this.deps = new Set()
  }
  get value(){
    refTrack(this)
    return this._value
  }
  set value(newVal){
    // 若设置的值与当前值一样，则不触发副作用
    if(isEqual(this._rawValue, newVal))return
    this._value = convert(newVal)
    this._rawValue = newVal
    triggerEffect(this.deps)
    return
  }
}

function refTrack(refImpl){
  if(isTracking())trackEffect(refImpl.deps)
}
function convert(newVal){
  return isObject(newVal) ? reactive(newVal) : newVal
}

export function ref(value){
  return new RefImpl(value)
}

export function isRef(foo){
  return !!foo.__v__isRef
}
export function unRef(foo){
  return isRef(foo) ? foo.value : foo
}

export function proxyRefs(target){
  return new Proxy(target, {
    get(target, key){
      const value = Reflect.get(target, key)
      return isRef(value) ? value.value : value
    },
    set(target, key, newVal){
      const value = Reflect.get(target, key)
      return isRef(value) && !isRef(newVal) ? value.value = newVal : Reflect.set(target, key, newVal)
    }
  })
}