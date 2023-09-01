const publicPropertiesMap = {
  $el: (instance)=> instance.vnode.el
}

export const PublicInstanceProxyHandler = {
  get(target, key){
    const {_: instance} = target
    const { setupState, vnode } = instance
    if(key in setupState){
      return setupState[key]
    }

    const getter = publicPropertiesMap[key]
    if(getter)return getter(instance)
  }
}