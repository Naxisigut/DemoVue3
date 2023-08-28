import { isObject } from '../shared/index';
import { createComponentInstance, setupComponent } from './component';

export function render(vnode, container){
  patch(vnode, container)
}0

function patch(vnode, container){
  const { type } = vnode 
  if(typeof type === 'string'){
    // 处理element
    processElement(vnode, container)
  }else if(isObject(type)){
    // 处理组件
    processComponent(vnode, container)
  }
}

function processElement(vnode: any, container: any) {
  //创建dom => 添加属性 => 挂载子节点 => 挂载至容器节点
  const { type, props, children } = vnode
  const el = document.createElement(type)

  for (const key in props) {
    if (Object.prototype.hasOwnProperty.call(props, key)) {
      el.setAttribute(key, props[key])
    }
  }

  if(typeof children === 'string'){
    el.textContent = children
  }else if(Array.isArray(children)){
    children.forEach((v) => {
      patch(v, el)
    })
  }


  container.appendChild(el)
}

function processComponent(vnode, container){
  // 1. 初始化组件 2.更新组件
  mountComponent(vnode, container)
}

// 初始化组件
function mountComponent(vnode: any, container: any) {
  // 初始化组件实例 => 处理组件实例（添加各种属性） => 获取组件template转化的或render得到的element vNode
  const instance = createComponentInstance(vnode)
  setupComponent(instance)
  setupRenderEffect(instance, container)
}

// 执行组件实例的render
function setupRenderEffect(instance, container: any) {
  const subTree = instance.render() // subtree is element type vnode
  patch(subTree, container)
}


