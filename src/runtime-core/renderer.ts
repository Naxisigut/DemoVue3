import { createComponentInstance, setupComponent } from './component';
import { ShapeFlag } from '../shared/shapeFlag';

export function render(vnode, container){
  patch(vnode, container)
}

function patch(vnode, container){
  const { shapeFlag } = vnode 
  if(shapeFlag & ShapeFlag.ELEMENT){
    // 处理element
    processElement(vnode, container)
  }else if(shapeFlag & ShapeFlag.STATEFUL_COMPONENT){
    // 处理component initialVnode
    processComponent(vnode, container)
  }
}


function processComponent(initialVnode, container){
  // 1. 初始化组件 2.更新组件
  mountComponent(initialVnode, container)
}

// 初始化组件
function mountComponent(initialVnode: any, container: any) {
  // 初始化组件实例 => 处理组件实例（添加各种属性） => 获取组件template转化/render得到的element vNode
  const instance = createComponentInstance(initialVnode)
  setupComponent(instance)
  setupRenderEffect(instance, container)
}

// 执行组件实例的render
function setupRenderEffect(instance, container: any) {
  const { proxy, vnode } = instance
  // subtree is element type vnode
  // the result of component vnode render function must be a element vnode
  const subTree = instance.render.call(proxy) 
  patch(subTree, container)

  vnode.el = subTree.el
}



function processElement(vnode: any, container: any) {
  // 1. 初始化dom 2. 更新dom
  mountElement(vnode, container)
}

// 初始化dom
function mountElement(vnode, container){
  //创建dom => 添加属性 => 挂载子节点 => 挂载至容器节点
  const { type, props } = vnode
  const el = document.createElement(type)

  vnode.el = el

  for (const key in props) {
    const isOn = (str: string)=> /^on[A-Z]/.test(str)
    if (Object.prototype.hasOwnProperty.call(props, key)) {
      const val = props[key]
      if(isOn(key)){
        const e = key.slice(2).toLowerCase()
        el.addEventListener(e, val)
      }else{
        el.setAttribute(key, val)
      }
    }
  }

  // children could be element/component vnode
  mountChildren(vnode, el)
  // outer dom appended will be later than its children dom
  container.appendChild(el)
}


function mountChildren(vnode: any, el: any) {
  const { children, shapeFlag } = vnode
  if(shapeFlag & ShapeFlag.TEXT_CHILDREN){
    el.textContent = children
  }else if(shapeFlag & ShapeFlag.ARRAY_CHILDREN){
    children.forEach((v) => {
      patch(v, el)
    })
  }
}

