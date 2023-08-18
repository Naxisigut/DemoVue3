import { ReactiveEffect } from './effect';

export class ComputedImpl{
  private _getter: any
  private _value: any
  private _dirty: boolean = true // 锁，用于缓存数据，不频繁触发getter
  private _effect: ReactiveEffect
  constructor(getter){
    this._getter = getter
    // 被trigger时，effect的runner(getter)不立即触发
    // 而是打开_dirty锁，getter延迟到get的时候触发
    this._effect = new ReactiveEffect(getter, {
      schedular: ()=>{
        this._dirty = true
      }
    })
  }
  get value(){
    if(this._dirty){
      this._dirty = false //执行一次后关闭_dirty锁
      this._value = this._effect.run()
    }
    return this._value
  }
  set value(newVal){

  }
}


export function computed(getter){
  return new ComputedImpl(getter)
}