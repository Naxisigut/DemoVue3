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
    patch(null, vnode, container, null, null)
  }

  // n1: current vnode
  // n2: new vnode
  function patch(n1, n2, container, parent, anchor) {
    const { type, shapeFlag } = n2
    // 注意：在常规的根组件=>子组件/子元素的常规patch过程中，所有的vNode均为component/element， 其type分别为组件对象/标签类型字符串
    // 而这里的Fragment和Text只在处理slot时才会使用到
    switch (type) {
      case Fragment:
        processFragment(n2, container, parent, anchor)
        break;
      case Text:
        processText(n2, container)
        break;

      default:
        if (shapeFlag & ShapeFlag.ELEMENT) {
          // 处理element
          processElement(n1, n2, container, parent, anchor)
        } else if (shapeFlag & ShapeFlag.STATEFUL_COMPONENT) {
          // 处理component initialVnode
          processComponent(n2, container, parent, anchor)
        }
        break;
    }
  }

  
  /*****************************************************************************/
  /****************************** patch: Fragment & Text ***********************/
  /*****************************************************************************/
  function processFragment(vnode, container, parent, anchor) {
    const { children } = vnode
    // Fragment类型的vnode，只渲染子节点
    mountChildren(children, container, parent, anchor)
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
  function processComponent(initialVnode, container, parent, anchor) {
    // 1. 初始化组件 2.更新组件
    mountComponent(initialVnode, container, parent, anchor)
  }

  // 初始化组件
  function mountComponent(initialVnode: any, container: any, parent, anchor) {
    // 初始化组件实例 => 处理组件实例（添加各种属性） => 获取组件template转化/render得到的element vNode
    const instance = createComponentInstance(initialVnode, parent)
    setupComponent(instance)
    setupRenderEffect(instance, container, anchor)
  }

  // 执行组件实例的render并处理
  // 在响应式数据更新时，render会被重复执行
  function setupRenderEffect(instance, container: any, anchor) {
    effect(() => {
      if(!instance.isMounted){
        const { proxy } = instance
        // subtree is element type vnode
        // the result of component vnode render function must be a element vnode
        const newSubTree = instance.render.call(proxy)
        instance.subTree = newSubTree
        patch(null, newSubTree, container, instance, anchor) // parent Instance

        instance.isMounted = true
      }else {
        const { proxy, subTree } = instance
        const newSubTree = instance.render.call(proxy)
        instance.subTree = newSubTree
        console.log('newSubTree',  newSubTree);
        patch(subTree, newSubTree, container, instance, anchor) // parent Instance
      }
    })
  }


  /*****************************************************************************/
  /******************************** patch: Element *****************************/
  /*****************************************************************************/
  function processElement(n1, n2: any, container: any, parent, anchor) {
    if(!n1){
      mountElement(n2, container, parent, anchor)
    }else{
      patchElement(n1, n2, container, parent, anchor)
    }
  }

  // 初始化dom
  function mountElement(vnode, container, parent, anchor) {
    //创建dom => 添加属性 => 挂载子节点 => 挂载至容器节点
    const { type, props, children, shapeFlag } = vnode
    const el = hostCreateElement(type)

    vnode.el = el

    for (const key in props) {
      if (Object.prototype.hasOwnProperty.call(props, key)) {
        const val = props[key]
        hostPatchProp(el, key, null, val)
      }
    }

    // children could be element/component vnode
    if (shapeFlag & ShapeFlag.TEXT_CHILDREN) {
      el.textContent = children
    } else if (shapeFlag & ShapeFlag.ARRAY_CHILDREN) {
      mountChildren(children, el, parent, anchor)
    }
    // outer dom appended will be later than its children dom
    hostInsert(el, container, anchor)
  }

  function mountChildren(children: any, el: any, parent, anchor) {
    children.forEach((v) => {
      patch(null, v, el, parent, anchor)
    })
  }

  // 更新dom元素
  /**
   * 
   * @param n1 改变前的vnode
   * @param n2 改变后的vnode
   * @param container 容器
   */
  function patchElement(n1, n2, container, parent, anchor){
    const prevProps = n1.props || {}
    const nextProps = n2.props || {}
    const el = n2.el = n1.el as HTMLElement
    patchProps(el, prevProps, nextProps)

    // const prevChildren = n1.children
    // const nextChildren = n2.children
    // console.log('prevChildren', prevChildren);
    // console.log('nextChildren', nextChildren);
    patchChildren(n1, n2, el, parent, anchor)
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

  function patchChildren(n1, n2, container, parent, anchor){
    const { children: prevChildren, shapeFlag: prevFlag } = n1
    const { children: nextChildren, shapeFlag: nextFlag } = n2

    if(nextFlag & ShapeFlag.TEXT_CHILDREN){
      // 1. array => text
      // 2. text => text
      if(prevFlag & ShapeFlag.ARRAY_CHILDREN){
        unMountChildren(prevChildren)
      }
      if(prevChildren !== nextChildren){
        hostSetElementText(container, nextChildren) // 设置text node
      }
    }else{
      if(prevFlag & ShapeFlag.TEXT_CHILDREN){
        // 3. text => array
        hostSetElementText(container, '') // 删除text children node
        mountChildren(nextChildren, container, parent, anchor) // 新增array children node
      }else{
        // 4. array => array
        patchKeyedChildren(prevChildren, nextChildren, container, parent, anchor)
      }
    }
  }

  function patchKeyedChildren(c1, c2, container, parent, parentAnchor){
    // console.log(c1, c2);
    let i = 0
    let e1 = c1.length - 1
    let e2 = c2.length - 1

    function isSameVnode(n1, n2){
      return n1.type === n2.type && n1.key === n2.key
    }

    // 左侧对比
    // 出此循环, i ∈ [0, min(e1, e2) +1]
    while(i <= e1 && i <= e2){
      const n1 = c1[i]
      const n2 = c2[i]
      if(isSameVnode(n1, n2)){
        patch(n1, n2, container, parent, parentAnchor)
      }else{
        break
      }
      i++
    }
    // console.log(i, e1, e2);


    // 右侧对比
    // 出此循环, e1&e2 ∈ [-1, e.length-1]
    while(i <= e1 && i <= e2){
      const n1 = c1[e1]
      const n2 = c2[e2]
      if(isSameVnode(n1, n2)){
        patch(n1, n2, container, parent, parentAnchor)
      }else{
        break
      }
      e1--
      e2--
    }
    console.log(i, e1, e2);

    // 左侧&右侧新增
    if(i > e1){
      if(i <= e2){
        const nextPos = e2 + 1
        // nextPos < c2.length 表示右侧有相同的vnode，即新增在左侧；反之则新增在右侧
        const anchor = nextPos < c2.length ? c2[nextPos].el : null
        while(i <= e2){
          patch(null, c2[i], container, parent, anchor)
          i++
        }
      }
    }else 
    // 右侧删减
    if(i > e2){
      while(i <= e1){
        hostRemove(c1[i].el)
        i++
      }
    }

  }

  function unMountChildren(children){
    children.forEach((childVnode) => {
      const { el } = childVnode
      hostRemove(el)
    })
  }



  return {
    createApp: createAppApi(render)
  }
}


