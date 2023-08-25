import { createComponentInstance, setupComponent } from './component';

export function render(vnode, container){
  patch(vnode, container)
}

function patch(vnode, container){
  // 处理组件
  processComponent(vnode, container)
}

function processComponent(vnode, container){
  // 1. 初始化组件 2.更新组件
  mountComponent(vnode, container)
}

// 初始化组件
function mountComponent(vnode: any, container: any) {
  // 初始化组件实例 => 处理组件实例 => 获取组件vNode
  const instance = createComponentInstance(vnode)

  setupComponent(instance)
  setupRenderEffect(instance, container)
}

// 执行组件实例的render
function setupRenderEffect(instance, container: any) {
  const subTree = instance.render() // this is element type vnode
  patch(subTree, container)
}
