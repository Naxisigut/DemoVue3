import { initProps } from "./componentProps";
import { PublicInstanceProxyHandler } from "./componentPublicInstance"

// 创建组件实例
export function createComponentInstance(vnode: any) {
  const instance = {
    name: vnode.type.name,
    vnode,
    type: vnode.type // component object, refer to "createVNode"
  }

  return instance
}

// 处理组件实例的属性
export function setupComponent(instance) {
  initProps(instance, instance.vnode)
  // TODO init slots

  // init setup & render
  // 非函数式组件
  setupStatefulComponent(instance)
}

// 处理组件实例的属性-执行setup
function setupStatefulComponent(instance: any) {
  // 挂载proxy，即render中的this指向
  instance.proxy = new Proxy({_: instance}, PublicInstanceProxyHandler)
  
  const { props, type: Component } = instance
  const { setup } = Component 
  if(setup){
    const setupRes = setup(props) // function/object
    handleSetupResult(instance, setupRes || {})
  }
}

// 处理组件实例的属性-挂载setupState
function handleSetupResult(instance: any, setupRes: any) {
  if(typeof setupRes === 'object'){
    instance.setupState = setupRes
  }
  finishComponentSetup(instance)
}

// 处理组件实例的属性-挂载render
function finishComponentSetup(instance: any) {
  const Component = instance.type
  if(!instance.render){
    instance.render = Component.render
  }
}





