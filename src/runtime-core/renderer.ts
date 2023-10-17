import { createComponentInstance, setupComponent } from './component';
import { ShapeFlag } from '../shared/shapeFlag';
import { Fragment, Text } from './vnodes';
import { createAppApi } from './createApp';
import { effect } from '../reactivity/effect';


export function createRenderer(option) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText
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

  
  /*****************************************************************************/
  /****************************** patch: Fragment & Text ***********************/
  /*****************************************************************************/
  function processFragment(vnode, container, parent) {
    // Fragment类型的vnode，只渲染子节点
    mountChildren(vnode, container, parent)
  }
  function processText(vnode: any, container: any) {
    const { children } = vnode
    const el = document.createTextNode(children)
    vnode.el = el
    container.appendChild(el)
  }


  /*****************************************************************************/
  /****************************** patch: Component *****************************/
  /*****************************************************************************/
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
        const { proxy } = instance
        // subtree is element type vnode
        // the result of component vnode render function must be a element vnode
        const newSubTree = instance.render.call(proxy)
        instance.subTree = newSubTree
        patch(null, newSubTree, container, instance) // parent Instance

        instance.isMounted = true
      }else {
        const { proxy, subTree } = instance
        const newSubTree = instance.render.call(proxy)
        instance.subTree = newSubTree
        patch(subTree, newSubTree, container, instance) // parent Instance
      }
    })
  }


  /*****************************************************************************/
  /******************************** patch: Element *****************************/
  /*****************************************************************************/
  function processElement(n1, n2: any, container: any, parent) {
    if(!n1){
      mountElement(n2, container, parent)
    }else{
      patchElement(n1, n2, container, parent)
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
        hostPatchProp(el, key, null, val)
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

  // 更新dom元素
  /**
   * 
   * @param n1 改变前的vnode
   * @param n2 改变后的vnode
   * @param container 容器
   */
  function patchElement(n1, n2, container, parent){
    const prevProps = n1.props || {}
    const nextProps = n2.props || {}
    const el = n2.el = n1.el as HTMLElement
    patchProps(el, prevProps, nextProps)

    // const prevChildren = n1.children
    // const nextChildren = n2.children
    // console.log('prevChildren', prevChildren);
    // console.log('nextChildren', nextChildren);
    patchChildren(n1, n2, el, parent)
  }
  
  function patchProps(el: HTMLElement, prevProps: any, nextProps: any) {
    for (const key in nextProps) {
      const prevValue = prevProps[key]
      const nextValue = nextProps[key];
      if(prevValue !== nextValue){
        // 所有和dom操作直接相关的代码应该交由配置对象提供的接口来完成
        hostPatchProp(el, key, prevValue, nextValue)
      }
    }

    for (const key in prevProps) {
      if(!(key in nextProps)){
        hostPatchProp(el, key, prevProps[key], null)
      }
    }
  }

  function patchChildren(n1, n2, container, parent){
    const { children: prevChildren, shapeFlag: prevFlag } = n1
    const { children: nextChildren, shapeFlag: nextFlag } = n2

    if(prevFlag & ShapeFlag.ARRAY_CHILDREN){
      if(nextFlag & ShapeFlag.TEXT_CHILDREN){
        // 1. array => text
        // unMountChildren(prevChildren) // 删除array children node
        hostSetElementText(container, nextChildren) // 新增text children node
        // ps. 由于设置元素textContent后会自动删除原有的子节点，所以这里没有必要调用unMountChildren
      }
    }else{
      if(nextFlag & ShapeFlag.ARRAY_CHILDREN){
        // 2. text => array
        hostRemove(n2.el.childNodes[0]) // 删除text children node
        mountChildren(n2, container, parent) // 新增array children node
      }else{
        // 3. text => text
        hostSetElementText(container, nextChildren) // 改变textContent
      }
    }
  }

  function unMountChildren(prevChildren){
    prevChildren.forEach((childVnode) => {
      const { el } = childVnode
      hostRemove(el)
    })
  }



  return {
    createApp: createAppApi(render)
  }
}


