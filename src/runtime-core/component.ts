export function processComponent(vnode, container){
  // 1. 初始化组件 2.更新组件
  mountComponent(vnode, container)
}

// 初始化组件
function mountComponent(vnode: any, container: any) {
  // 初始化组件实例 => 处理组件实例 => 获取组件vNode
  const instance = createInstance(vnode)

  setupComponent(instance)

  setupRenderEffect(instance, container)
}

// 创建组件实例
function createInstance(vnode: any) {
  const component = {
    vnode,
    component: vnode.type // component object, refer to "createVNode"
  }

  return component
}

// 给组件实例挂载数据
function setupComponent(instance) {
  // TODO init props
  // TODO init slots

  // setup & render
  // 非函数式组件
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: any) {
  const { setup } = instance.component 
  if(setup){
    const setupRes = setup()
    handleSetupResult(setupRes, instance)
  }
  
}

// 执行setup并挂载其结果
function handleSetupResult(setupRes: any, instance: any) {
  instance.setupState = setupRes
  finishComponentSetup(instance)
}

// 挂载render
function finishComponentSetup(instance: any) {
  instance.render = instance.component.render
}

function setupRenderEffect(instance, container: any) {
  throw new Error("Function not implemented.")
}




