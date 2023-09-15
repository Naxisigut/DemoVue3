import { createComponentInstance, setupComponent } from './component';
import { ShapeFlag } from '../shared/shapeFlag';
import { Fragment, Text } from './vnodes';
import { createAppApi } from './createApp';
import { effect } from '../reactivity/effect';


export function createRenderer(option) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert
  } = option


  function render(vnode, container) {
    patch(null, vnode, container, null)
  }

  // n1: current vnode
  // n2: new vnode
  function patch(n1, n2, container, parent) {
    const { type, shapeFlag } = n2
    // TODO: fragment => shapeFlag
    switch (type) {
      case Fragment:
        processFragment(n2, container, parent)
        break;
      case Text:
        processText(n2, container)
        break;

      default:
        if (shapeFlag & ShapeFlag.ELEMENT) {
          // 处理element
          processElement(n1, n2, container, parent)
        } else if (shapeFlag & ShapeFlag.STATEFUL_COMPONENT) {
          // 处理component initialVnode
          processComponent(n2, container, parent)
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
    effect(() => {
      if(!instance.isMounted){
        const { proxy, vnode } = instance
        // subtree is element type vnode
        // the result of component vnode render function must be a element vnode
        const newSubTree = instance.render.call(proxy)
        vnode.el = newSubTree.el
        patch(null, newSubTree, container, instance) // parent Instance

        instance.isMounted = true
        instance.subTree = newSubTree
      }else {
        const { proxy, vnode, subTree } = instance
        const newSubTree = instance.render.call(proxy)
        vnode.el = newSubTree.el
        instance.subTree = newSubTree
        patch(subTree, newSubTree, container, instance) // parent Instance
      }
    })
  }



  function processElement(n1, n2: any, container: any, parent) {
    if(!n1){
      mountElement(n2, container, parent)
    }else{
      patchElement(n1, n2, container)
    }
  }

  // 初始化dom
  function mountElement(vnode, container, parent) {
    //创建dom => 添加属性 => 挂载子节点 => 挂载至容器节点
    const { type, props } = vnode
    const el = hostCreateElement(type)

    vnode.el = el

    for (const key in props) {
      if (Object.prototype.hasOwnProperty.call(props, key)) {
        const val = props[key]
        hostPatchProp(key, val, el)
      }
    }

    // children could be element/component vnode
    mountChildren(vnode, el, parent)
    // outer dom appended will be later than its children dom
    hostInsert(el, container)
  }

  function mountChildren(vnode: any, el: any, parent) {
    const { children, shapeFlag } = vnode
    if (shapeFlag & ShapeFlag.TEXT_CHILDREN) {
      el.textContent = children
    } else if (shapeFlag & ShapeFlag.ARRAY_CHILDREN) {
      children.forEach((v) => {
        patch(null, v, el, parent)
      })
    }
  }

  // 更新dom
  function patchElement(n1, n2, container){
    console.log('n1', n1);
    console.log('n2', n2);
  }

  return {
    createApp: createAppApi(render)
  }
}
