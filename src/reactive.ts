export function reactive(target){
  const _proxy = new Proxy(target, {
    get(target, key){
      // 收集依赖

      
      return Reflect.get(target, key)
    },
    set(target, key, value){
      // 触发依赖


      return Reflect.set(target, key, value)
    }
  })
  return _proxy
}