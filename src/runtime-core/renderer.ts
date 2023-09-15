import { createComponentInstance, setupComponent } from './component';
import { ShapeFlag } from '../shared/shapeFlag';
import { Fragment, Text } from './vnodes';
import { createAppApi } from './createApp';


export function createRenderer(option) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert
  } = option


  function render(vnode, container) {
    patch(vnode, container, null)
  }

  function patch(vnode, container, parent) {
    const { type, shapeFlag } = vnode
    // TODO: fragment => shapeFlag
    switch (type) {
      case Fragment:
        processFragment(vnode, container, parent)
        break;
      case Text:
        processText(vnode, container)
        break;

      default:
        if (shapeFlag & ShapeFlag.ELEMENT) {
          // 处理element
          processElement(vnode, container, parent)
        } else if (shapeFlag & ShapeFlag.STATEFUL_COMPONENT) {
          // 处理component initialVnode
          processComponent(vnode, container, parent)
        }
        break;
    }
  }


  function processText(vnode: any, container: any) {
    const { children } = vnode
    const el = document.createTextNode(children)
    vnode.el = el
    container.appendChild(el)
  }

  function processFragment(vnode, container, parent) {
    // Fragment类型的vnode，只渲染子节点
    mountChildren(vnode, container, parent)
  }

  function processComponent(initialVnode, container, parent) {
    // 1. 初始化组件 2.更新组件
    mountComponent(initialVnode, container, parent)
  }

  // 初始化组件
  function mountComponent(initialVnode: any, container: any, parent) {
    // 初始化组件实例 => 处理组件实例（添加各种属性） => 获取组件template转化/render得到的element vNode
    const instance = createComponentInstance(initialVnode, parent)
    setupComponent(instance)
    setupRenderEffect(instance, container)
  }

  // 执行组件实例的render
  function setupRenderEffect(instance, container: any) {
    const { proxy, vnode } = instance
    // subtree is element type vnode
    // the result of component vnode render function must be a element vnode
    const subTree = instance.render.call(proxy)
    patch(subTree, container, instance) // parent Instance

    vnode.el = subTree.el
  }



  function processElement(vnode: any, container: any, parent) {
    // 1. 初始化dom 2. 更新dom
    mountElement(vnode, container, parent)
  }

  // 初始化dom
  function mountElement(vnode, container, parent) {
    //创建dom => 添加属性 => 挂载子节点 => 挂载至容器节点
    const { type, props } = vnode
    // const el = document.createElement(type)
    const el = hostCreateElement(type)

    vnode.el = el

    for (const key in props) {
      if (Object.prototype.hasOwnProperty.call(props, key)) {
        const val = props[key]
        // if(isOn(key)){
        //   const e = key.slice(2).toLowerCase()
        //   el.addEventListener(e, val)
        // }else{
        //   el.setAttribute(key, val)
        // }
        hostPatchProp(key, val, el)
      }
    }

    // children could be element/component vnode
    mountChildren(vnode, el, parent)
    // outer dom appended will be later than its children dom
    // container.appendChild(el)
    hostInsert(el, container)
  }


  function mountChildren(vnode: any, el: any, parent) {
    const { children, shapeFlag } = vnode
    if (shapeFlag & ShapeFlag.TEXT_CHILDREN) {
      el.textContent = children
    } else if (shapeFlag & ShapeFlag.ARRAY_CHILDREN) {
      children.forEach((v) => {
        patch(v, el, parent)
      })
    }
  }

  return {
    createApp: createAppApi(render)
  }
}
