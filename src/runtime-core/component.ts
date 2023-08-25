// 创建组件实例
export function createComponentInstance(vnode: any) {
  const component = {
    vnode,
    type: vnode.type // component object, refer to "createVNode"
  }

  return component
}

// 处理组件实例的属性
export function setupComponent(instance) {
  // TODO init props
  // TODO init slots

  // setup & render
  // 非函数式组件
  setupStatefulComponent(instance)
}

// 处理组件实例的属性-执行setup
function setupStatefulComponent(instance: any) {
  const Component = instance.type
  const { setup } = Component 
  if(setup){
    const setupRes = setup() // function/object
    handleSetupResult(instance, setupRes)
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
  if(instance.render){
    instance.render = Component.render
  }
}





