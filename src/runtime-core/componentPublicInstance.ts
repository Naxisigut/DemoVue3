import { hasOwn } from "../shared/index"

const publicPropertiesMap = {
  $el: (instance)=> instance.vnode.el,
  $slots: (instance) => instance.slots,
  $props: (instance) => instance.props,
}

export const PublicInstanceProxyHandler = {
  get(target, key){
    const {_: instance} = target
    const { setupState, vnode, props } = instance
    
    if(hasOwn(setupState, key)){
      return setupState[key]
    }else if(hasOwn(props, key)){
      return props[key]
    }
    const getter = publicPropertiesMap[key]
    if(getter)return getter(instance)
  }
}