import { createComponentInstance, setupComponent } from './component';
import { ShapeFlag } from '../shared/shapeFlag';
import { Fragment, Text } from './vnodes';
import { createAppApi } from './createApp';
import { effect } from '../reactivity/effect';
import { shouldUpdateComponent } from './componetUpdateUtils';
import { queueJobs } from './schedular';


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
          processComponent(n1, n2, container, parent, anchor)
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
  function processComponent(n1, n2, container, parent, anchor) {
    // 1. 初始化组件 2.更新组件
    if(!n1){
      mountComponent(n2, container, parent, anchor)
    }else{
      updateComponent(n1, n2)
    }
  }

  // 初始化组件
  function mountComponent(initialVnode: any, container: any, parent, anchor) {
    // 初始化组件实例 => 处理组件实例（添加各种属性） => 获取组件template转化/render得到的element vNode
    const instance = initialVnode.component = createComponentInstance(initialVnode, parent)
    setupComponent(instance)
    setupRenderEffect(instance, container, anchor)
  }

  // 执行组件实例的render并处理
  // 在响应式数据更新时，render会被重复执行
  function setupRenderEffect(instance, container: any, anchor) {
    instance.update = effect(() => {
      console.log('instance update');

      if(!instance.isMounted){
        const { proxy } = instance
        // subtree is element type vnode
        // the result of component vnode render function must be a element vnode
        const newSubTree = instance.render.call(proxy)
        instance.subTree = newSubTree
        patch(null, newSubTree, container, instance, anchor) // parent Instance

        instance.isMounted = true
      }else {
        const { proxy, subTree, next, vnode } = instance
        if(next){
          next.el = vnode.el // TODO：目前所有component vnode的el均为null
          updateComponentPreRender(instance, next)
        }
        const newSubTree = instance.render.call(proxy)
        instance.subTree = newSubTree
        // console.log('newSubTree',  newSubTree);
        patch(subTree, newSubTree, container, instance, anchor) // parent Instance
      }
    }, {
      schedular:()=>{
        queueJobs(instance.update)
      }
    })
  }

  // 更新组件
  function updateComponent(n1, n2){
    const instance = n2.component = n1.component 
    // debugger
    if(shouldUpdateComponent(n1, n2)){
      // console.log(1212, n1, n2);
      instance.next = n2
      instance.update()
    }else{
      n2.el = n1.el
      instance.vnode = n2
    }
  }

  // 更新组件实例的props
  function updateComponentPreRender(instance, nextVnode){
    instance.vnode = nextVnode
    instance.next = null
    instance.props = nextVnode.props
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
    // console.log('patch Ele');
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
    // console.log(i, e1, e2);

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
    }else
    // 中间对比
    {
      let toBePatched = 0 // 需要patch的节点个数
      let patched = 0 // 已经patch的节点个数
      // 收集新的vnode的key为一个map
      const keyToNewIndexMap = new Map()
      for (let index = i; index <= e2; index++) {
        const nextVnode = c2[index]
        toBePatched++
        keyToNewIndexMap.set(nextVnode.key, index)
      }
      let moved = false
      let maxNewIndexSoFar = 0

      // newIndexToOldIndexMap收集同一个节点在新数组中的索引=>在老数组中的索引的映射
      // 索引: 节点在新数组中除去两端后的索引
      // 索引值: 节点在老数组中的索引+1
      const newIndexToOldIndexMap = new Array(toBePatched)
      for (let index = 0; index < toBePatched; index++) newIndexToOldIndexMap[index] = 0 // 初始化， [0 0 0 0...]

      /* 逻辑1: 删除多余节点 */
      // 遍历c1, 看在c2中是否有对应的新节点, 有则按c1的顺序patch，无则删除
      for (let index = i; index <= e1; index++) {
        const prevVnode = c1[index]
        if(patched >= toBePatched){ // 若数量上已经有足够的节点被patch，则剩下的所有节点都是需要被删除的，不用寻找对应的新节点
          hostRemove(prevVnode.el)
          continue
        }

        let newIndex
        if(prevVnode.key != null){
          newIndex = keyToNewIndexMap.get(prevVnode.key)
        }else{
          for (let j = i; j <= e2; j++) {
            const nextVnode = c2[j];
            if(isSameVnode(prevVnode, nextVnode)){
              newIndex = j
              break
            }
          }
        }
        
        if(newIndex !== undefined){
          const nextVnode = c2[newIndex]
          patch(prevVnode, nextVnode, container, parent, null)
          patched++
          newIndexToOldIndexMap[newIndex - i] = index + 1; // index + 1是为了避免index为0的情况
          // ps.如果一个节点位置没有改变，那么若索引为x，索引值就为x+i+1

          // 若newIndex在历次循环中保持递增，则表示所有的老节点没有移动; 反之老节点中存在移动
          // 比如说 A (B C D E) F => A (C D) F, 老节点没有移动
          (newIndex >= maxNewIndexSoFar) ? (maxNewIndexSoFar = newIndex) : (moved = true)
        }else{
          hostRemove(prevVnode.el)
        }
      }

      /* 逻辑2: patch新增的节点；获取新增的节点需要遍历c2 */
      /* 逻辑3: 对比新老节点的位置并移动 */
      /* 移动的逻辑：在新老序列中寻找一个最长递增子序列，子序列的所有元素视为无需改变位置的元素，其它的视为需要移动的元素，插入递增子序列的不同位置，最后变成nextChildren的顺序。 */

      // 获取最长递增子序列，结果数组的每一个元素都是最长递增子序列在父序列中的索引
      // 如：结果为[1, 2], 表示父序列的( arr[1], arr[2] )为最长子序列
      const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : [] 
      // console.log(newIndexToOldIndexMap, increasingNewIndexSequence);

      // 新增&移动
      let j = increasingNewIndexSequence.length -1
      for (let index = toBePatched -1; index >= 0; index--) {
        const nextIndex = index + i
        const nextNode = c2[nextIndex]
        const anchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null
        if(newIndexToOldIndexMap[index] === 0){ // 老节点索引为0，表示这个新节点在没有对应的老节点
          patch(null, nextNode, container, parent, anchor)
        }else if(moved){
          if(j >= 0 && index === increasingNewIndexSequence[j]){
            j-- // index对应的元素属于最长子序列，不需要移动
          }else{
            // 移动：在最长子序列中插入需要移动的节点
            // 这里利用了hostInsert(node.insertBefore)的特性：插入的节点保持唯一性；若已在文档存在，则会被移动位置，而非插入一个相同的节点
            // https://developer.mozilla.org/zh-CN/docs/Web/API/Node/insertBefore
            hostInsert(nextNode.el, container, anchor) 
          } 
        }
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

// 获得最长递增序列的序号
// [1, 3, 4, 5, 3, 6] => [0, 1, 2, 3, 5]
function getSequence(arr) {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}

