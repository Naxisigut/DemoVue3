import { track, trigger } from './effect';

export function reactive(target){
  const _proxy = new Proxy(target, {
    get(target, key){
      const res = Reflect.get(target, key)
      // 收集依赖
      track(target, key)

      return res
    },
    set(target, key, value){
      const res = Reflect.set(target, key, value)
      // 触发依赖， 且需在数据set后触发
      trigger(target, key)

      return res
    }
  })
  return _proxy
}