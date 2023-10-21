'use strict';

const extend = Object.assign;
const isObject = (val) => {
    return typeof val === 'object' && val !== null;
};
const isEqual = (newVal, val) => {
    return Object.is(newVal, val);
};
const hasOwn = (target, key) => {
    return Object.prototype.hasOwnProperty.call(target, key);
};
// 首字母大写
const captalize = (str) => {
    if (!str)
        return "";
    return str[0].toUpperCase() + str.slice(1);
};
// 驼峰化
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : '';
    });
};
const toHandlerKey = (str) => {
    return str ? camelize(`on${captalize(str)}`) : '';
};
// 是否以on开头
const isOn = (str) => {
    return /^on[A-Z]/.test(str);
};

const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        shapeFlag: getShapeFlag(type),
        children,
        el: null,
        key: props && props.key
    };
    // question: children为undefined?
    if (typeof children === 'string') {
        vnode.shapeFlag |= 4 /* ShapeFlag.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ShapeFlag.ARRAY_CHILDREN */;
    }
    else if (isObject(children) && (2 /* ShapeFlag.STATEFUL_COMPONENT */ & vnode.shapeFlag)) {
        vnode.shapeFlag |= 16 /* ShapeFlag.SLOT_CHILDREN */;
    }
    // console.log(11, vnode);
    return vnode;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}
function getShapeFlag(type) {
    return typeof type === 'string' ? 1 /* ShapeFlag.ELEMENT */ : 2 /* ShapeFlag.STATEFUL_COMPONENT */;
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

// help render slots in compoent render
function renderSlot(slots, slotName, scope) {
    // slots is slotContentObject offered by father component
    const slot = slots[slotName];
    if (slot) {
        // because of scoped slot, slot here is a function
        return createVNode(Fragment, {}, slot(scope));
    }
}

let currComponent = null;
function setCurrentInstance(instance) {
    currComponent = instance;
}
function getCurrentInstance() {
    return currComponent;
}

function provide(key, value) {
    const instance = getCurrentInstance();
    if (!instance)
        return;
    // console.log('provide', instance);
    let { provides, parent } = instance;
    if (parent && provides === parent.provides) {
        provides = instance.provides = Object.create(parent.provides);
    }
    provides[key] = value;
}
function inject(key, defaultVal) {
    const instance = getCurrentInstance();
    // console.log('inject', instance);
    // 这里可以对parent是否存在加一层判断，防止在顶层组件里调用inject
    const { provides: parentProvides } = instance.parent;
    if (key in parentProvides)
        return parentProvides[key]; // 对于原型上的属性，key in 返回true
    return typeof defaultVal === 'function' ? defaultVal() : defaultVal;
}

class ReactiveEffect {
    constructor(_fn, option) {
        this.fn = _fn;
        extend(this, option);
        this.deps = new Set();
        this.active = true;
    }
    run() {
        if (!this.active) {
            // 若effect已处于stopped，则不用收集这个effect，直接执行fn即可
            return this.fn();
        }
        shouldTrack = true; // 在真正需要track的时候打开shouldTrack
        activeEffect = this;
        const res = this.fn();
        shouldTrack = false; // fn执行完后关闭shouldTrack
        return res;
    }
    stop() {
        if (this.active) {
            clearEffect(this);
            this.active = false;
            if (this.onStop)
                this.onStop();
        }
    }
}
/* 清除副作用 */
function clearEffect(effect) {
    // 双向清空
    // 1,从容器中删除effect
    for (const keyDeps of effect.deps) {
        keyDeps.delete(effect);
    }
    // 2.清空effect中的容器
    effect.deps.length = 0;
}
let activeEffect; // 当前进行依赖收集的副作用函数
let shouldTrack = false; // 判断当前能否收集依赖
function isTracking() {
    // 若activeEffect为undefined，说明此时不是通过effect进入，不进行依赖收集
    // 若shouldTrack为false, 说明此时的activeEffect为stopped状态，不进行依赖收集
    // 两者均为truthy时，表示正要track
    return shouldTrack && activeEffect;
}
/**
 * 依赖存放的数据结构为：
 * targetDepsMap: (Map)
 *  --target: targetDeps (Map)
 *    -- key: keyDeps (Set)
 */
const targetDepsMap = new Map(); // 存放所有依赖的容器
// 收集依赖
function track(target, key) {
    if (!isTracking())
        return;
    let targetDeps = targetDepsMap.get(target);
    // 若此对象没有收集过依赖，则初始化
    if (!targetDeps) {
        targetDeps = new Map();
        targetDepsMap.set(target, targetDeps);
    }
    let keyDeps = targetDeps.get(key);
    // 若此对象的此key没有收集过依赖，则初始化
    if (!keyDeps) {
        keyDeps = new Set();
        targetDeps.set(key, keyDeps);
    }
    trackEffect(keyDeps);
    // console.log('track', keyDeps);
}
function trackEffect(deps) {
    if (deps.has(activeEffect))
        return;
    // 一个effect的runner可以调用多个target的key，所以在targetDepsMap中可能有多个相同的effect
    // 一个target的key也可能有多个effect
    // 所以需要双向收集
    deps.add(activeEffect); // 正向收集依赖
    activeEffect.deps.add(deps); // 反向收集依赖 
}
// 触发依赖：在每次值set时触发对应的依赖
function trigger(target, key) {
    const targetDeps = targetDepsMap.get(target);
    const keyDeps = targetDeps.get(key);
    triggerEffect(keyDeps);
}
function triggerEffect(deps) {
    for (const effect of deps) {
        // 在trigger时，schedular优先于run
        if (effect.schedular) {
            effect.schedular();
        }
        else
            effect.run();
    }
}
// 副作用函数
function effect(fn, option = {}) {
    const _effect = new ReactiveEffect(fn, option);
    _effect.run();
    const runner = _effect.run.bind(_effect); // 绑定this
    runner.effect = _effect; // 挂上runner对应的effect，方便通过runner查找effect
    return runner;
}

/* proxy的get/set */
const createGetter = (isReadonly = false, isShallow = false) => {
    return function (target, key) {
        if (key === exports.ReactiveFlags.IS_REACTIVE) {
            return !isReadonly;
        }
        else if (key === exports.ReactiveFlags.IS_READONLY) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        if (!isReadonly) {
            track(target, key);
        }
        if (isObject(res) && !isShallow) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
};
const createSetter = () => {
    return function (target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
};
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
// const shallowMutableGet = createGetter(false, true)
const mutableHandler = {
    get,
    set
};
const readonlyHandler = {
    get: readonlyGet,
    set(target, key, newVal) {
        console.warn(`error: key ${key} 写入失败，因为target为readonly`);
        return true;
    }
};
const shallowReadonlyHandler = extend({}, readonlyHandler, { get: shallowReadonlyGet });
// export const shallowMutableHandler = extend({}, mutableHandler, { get: shallowMutableGet })

exports.ReactiveFlags = void 0;
(function (ReactiveFlags) {
    ReactiveFlags["IS_REACTIVE"] = "--v--isReactive";
    ReactiveFlags["IS_READONLY"] = "--v--isReadonly";
})(exports.ReactiveFlags || (exports.ReactiveFlags = {}));
function createReactiveObject(target, baseHandler) {
    if (!isObject(target)) {
        console.warn(`${target}必须是一个对象！`);
        return target;
    }
    return new Proxy(target, baseHandler);
}
function reactive(target) {
    return createReactiveObject(target, mutableHandler);
}
// export function shallowReactive(target){
//   return createReactiveObject(target, shallowMutableHandler)
// }
function readonly(target) {
    return createReactiveObject(target, readonlyHandler);
}
function shallowReadonly(target) {
    return createReactiveObject(target, shallowReadonlyHandler);
}
function isReactive(value) {
    return !!value[exports.ReactiveFlags.IS_REACTIVE];
}
function isReadonly(value) {
    return !!value[exports.ReactiveFlags.IS_READONLY];
}
function isProxy(value) {
    return isReactive(value) || isReadonly(value);
}

class RefImpl {
    constructor(value) {
        this.__v__isRef = true;
        // 对于对象，需要返回一个reactive代理对象
        this._value = convert(value);
        this._rawValue = value;
        this.deps = new Set();
    }
    get value() {
        refTrack(this);
        return this._value;
    }
    set value(newVal) {
        // 若设置的值与当前值一样，则不触发副作用
        if (isEqual(this._rawValue, newVal))
            return;
        this._value = convert(newVal);
        this._rawValue = newVal;
        triggerEffect(this.deps);
        return;
    }
}
function refTrack(refImpl) {
    if (isTracking())
        trackEffect(refImpl.deps);
}
function convert(newVal) {
    return isObject(newVal) ? reactive(newVal) : newVal;
}
function ref(value) {
    return new RefImpl(value);
}
function isRef(foo) {
    return !!foo.__v__isRef;
}
function unRef(foo) {
    return isRef(foo) ? foo.value : foo;
}
function proxyRefs(target) {
    return new Proxy(target, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, newVal) {
            const value = Reflect.get(target, key);
            return isRef(value) && !isRef(newVal) ? value.value = newVal : Reflect.set(target, key, newVal);
        }
    });
}

function emit(instance, e, ...args) {
    const { props } = instance;
    const handlerName = toHandlerKey(e);
    const handler = props[handlerName];
    handler && handler(...args);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

const publicPropertiesMap = {
    $el: (instance) => instance.vnode.el,
    $slots: (instance) => instance.slots
};
const PublicInstanceProxyHandler = {
    get(target, key) {
        const { _: instance } = target;
        const { setupState, vnode, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const getter = publicPropertiesMap[key];
        if (getter)
            return getter(instance);
    }
};

function initSlots(instance, children) {
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* ShapeFlag.SLOT_CHILDREN */) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        // rawSlot offered by father component
        // because of scoped slot, rawSlot here is a function
        // rawSlot function return vnode
        const rawSlot = children[key];
        // slots[key] is a function wraps rawSlot function
        slots[key] = (scope) => normalizeSlot(rawSlot(scope));
    }
}
function normalizeSlot(slotVnode) {
    return Array.isArray(slotVnode) ? slotVnode : [slotVnode];
    // return [slot]
}

// 创建组件实例
function createComponentInstance(vnode, parent) {
    const instance = {
        name: vnode.type.name,
        vnode,
        type: vnode.type,
        emit: () => { },
        slots: {},
        props: {},
        provides: parent ? parent.provides : {},
        parent,
        isMounted: false,
        subTree: {}
        // el,
        // render
    };
    instance.emit = emit.bind(null, instance);
    return instance;
}
// 处理组件实例的属性
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    // init setup & render
    // 非函数式组件
    setupStatefulComponent(instance);
}
// let currentInstance = null
// 处理组件实例的属性-执行setup
function setupStatefulComponent(instance) {
    // 挂载proxy，即render中的this指向
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandler);
    const { props, type: Component, emit } = instance;
    const { setup } = Component;
    if (setup) {
        setCurrentInstance(instance);
        const setupRes = setup(shallowReadonly(props), { emit }); // function/object
        handleSetupResult(instance, setupRes || {}); // 
    }
    setCurrentInstance(null);
}
// 处理组件实例的属性-挂载setupState
function handleSetupResult(instance, setupRes) {
    if (typeof setupRes === 'object') {
        instance.setupState = proxyRefs(setupRes);
    }
    finishComponentSetup(instance);
}
// 处理组件实例的属性-挂载render
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (!instance.render) {
        instance.render = Component.render;
    }
}

// import { createRenderer } from './renderer';
// my
// export function createAppApi(option){
//   const render = createRenderer(option)
//   return function createApp(rootComponent){
//     return {
//       mount(rootContainer){
//         // component => vnodes(component object) => component instance => vnode(element) => real node
//         const vnode = createVNode(rootComponent)
//         render(vnode, rootContainer)
//       }
//     }
//   }
// }
function createAppApi(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // component => vnodes(component object) => component instance => vnode(element) => real node
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            }
        };
    };
}

function createRenderer(option) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText } = option;
    function render(vnode, container) {
        patch(null, vnode, container, null, null);
    }
    // n1: current vnode
    // n2: new vnode
    function patch(n1, n2, container, parent, anchor) {
        const { type, shapeFlag } = n2;
        // 注意：在常规的根组件=>子组件/子元素的常规patch过程中，所有的vNode均为component/element， 其type分别为组件对象/标签类型字符串
        // 而这里的Fragment和Text只在处理slot时才会使用到
        switch (type) {
            case Fragment:
                processFragment(n2, container, parent, anchor);
                break;
            case Text:
                processText(n2, container);
                break;
            default:
                if (shapeFlag & 1 /* ShapeFlag.ELEMENT */) {
                    // 处理element
                    processElement(n1, n2, container, parent, anchor);
                }
                else if (shapeFlag & 2 /* ShapeFlag.STATEFUL_COMPONENT */) {
                    // 处理component initialVnode
                    processComponent(n2, container, parent, anchor);
                }
                break;
        }
    }
    /*****************************************************************************/
    /****************************** patch: Fragment & Text ***********************/
    /*****************************************************************************/
    function processFragment(vnode, container, parent, anchor) {
        const { children } = vnode;
        // Fragment类型的vnode，只渲染子节点
        mountChildren(children, container, parent, anchor);
    }
    function processText(vnode, container) {
        const { children } = vnode;
        const el = document.createTextNode(children);
        vnode.el = el;
        container.appendChild(el);
    }
    /*****************************************************************************/
    /****************************** patch: Component *****************************/
    /*****************************************************************************/
    function processComponent(initialVnode, container, parent, anchor) {
        // 1. 初始化组件 2.更新组件
        mountComponent(initialVnode, container, parent, anchor);
    }
    // 初始化组件
    function mountComponent(initialVnode, container, parent, anchor) {
        // 初始化组件实例 => 处理组件实例（添加各种属性） => 获取组件template转化/render得到的element vNode
        const instance = createComponentInstance(initialVnode, parent);
        setupComponent(instance);
        setupRenderEffect(instance, container, anchor);
    }
    // 执行组件实例的render并处理
    // 在响应式数据更新时，render会被重复执行
    function setupRenderEffect(instance, container, anchor) {
        effect(() => {
            if (!instance.isMounted) {
                const { proxy } = instance;
                // subtree is element type vnode
                // the result of component vnode render function must be a element vnode
                const newSubTree = instance.render.call(proxy);
                instance.subTree = newSubTree;
                patch(null, newSubTree, container, instance, anchor); // parent Instance
                instance.isMounted = true;
            }
            else {
                const { proxy, subTree } = instance;
                const newSubTree = instance.render.call(proxy);
                instance.subTree = newSubTree;
                console.log('newSubTree', newSubTree);
                patch(subTree, newSubTree, container, instance, anchor); // parent Instance
            }
        });
    }
    /*****************************************************************************/
    /******************************** patch: Element *****************************/
    /*****************************************************************************/
    function processElement(n1, n2, container, parent, anchor) {
        if (!n1) {
            mountElement(n2, container, parent, anchor);
        }
        else {
            patchElement(n1, n2, container, parent, anchor);
        }
    }
    // 初始化dom
    function mountElement(vnode, container, parent, anchor) {
        //创建dom => 添加属性 => 挂载子节点 => 挂载至容器节点
        const { type, props, children, shapeFlag } = vnode;
        const el = hostCreateElement(type);
        vnode.el = el;
        for (const key in props) {
            if (Object.prototype.hasOwnProperty.call(props, key)) {
                const val = props[key];
                hostPatchProp(el, key, null, val);
            }
        }
        // children could be element/component vnode
        if (shapeFlag & 4 /* ShapeFlag.TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ShapeFlag.ARRAY_CHILDREN */) {
            mountChildren(children, el, parent, anchor);
        }
        // outer dom appended will be later than its children dom
        hostInsert(el, container, anchor);
    }
    function mountChildren(children, el, parent, anchor) {
        children.forEach((v) => {
            patch(null, v, el, parent, anchor);
        });
    }
    // 更新dom元素
    /**
     *
     * @param n1 改变前的vnode
     * @param n2 改变后的vnode
     * @param container 容器
     */
    function patchElement(n1, n2, container, parent, anchor) {
        const prevProps = n1.props || {};
        const nextProps = n2.props || {};
        const el = n2.el = n1.el;
        patchProps(el, prevProps, nextProps);
        // const prevChildren = n1.children
        // const nextChildren = n2.children
        // console.log('prevChildren', prevChildren);
        // console.log('nextChildren', nextChildren);
        patchChildren(n1, n2, el, parent, anchor);
    }
    function patchProps(el, prevProps, nextProps) {
        for (const key in nextProps) {
            const prevValue = prevProps[key];
            const nextValue = nextProps[key];
            if (prevValue !== nextValue) {
                // 所有和dom操作直接相关的代码应该交由配置对象提供的接口来完成
                hostPatchProp(el, key, prevValue, nextValue);
            }
        }
        for (const key in prevProps) {
            if (!(key in nextProps)) {
                hostPatchProp(el, key, prevProps[key], null);
            }
        }
    }
    function patchChildren(n1, n2, container, parent, anchor) {
        const { children: prevChildren, shapeFlag: prevFlag } = n1;
        const { children: nextChildren, shapeFlag: nextFlag } = n2;
        if (nextFlag & 4 /* ShapeFlag.TEXT_CHILDREN */) {
            // 1. array => text
            // 2. text => text
            if (prevFlag & 8 /* ShapeFlag.ARRAY_CHILDREN */) {
                unMountChildren(prevChildren);
            }
            if (prevChildren !== nextChildren) {
                hostSetElementText(container, nextChildren); // 设置text node
            }
        }
        else {
            if (prevFlag & 4 /* ShapeFlag.TEXT_CHILDREN */) {
                // 3. text => array
                hostSetElementText(container, ''); // 删除text children node
                mountChildren(nextChildren, container, parent, anchor); // 新增array children node
            }
            else {
                // 4. array => array
                patchKeyedChildren(prevChildren, nextChildren, container, parent, anchor);
            }
        }
    }
    function patchKeyedChildren(c1, c2, container, parent, parentAnchor) {
        // console.log(c1, c2);
        let i = 0;
        let e1 = c1.length - 1;
        let e2 = c2.length - 1;
        function isSameVnode(n1, n2) {
            return n1.type === n2.type && n1.key === n2.key;
        }
        // 左侧对比
        // 出此循环, i ∈ [0, min(e1, e2) +1]
        while (i <= e1 && i <= e2) {
            const n1 = c1[i];
            const n2 = c2[i];
            if (isSameVnode(n1, n2)) {
                patch(n1, n2, container, parent, parentAnchor);
            }
            else {
                break;
            }
            i++;
        }
        // 右侧对比
        // 出此循环, e1&e2 ∈ [-1, e.length-1]
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1];
            const n2 = c2[e2];
            if (isSameVnode(n1, n2)) {
                patch(n1, n2, container, parent, parentAnchor);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        console.log(i, e1, e2);
        // 左侧&右侧新增
        if (i > e1) {
            if (i <= e2) {
                const nextPos = e2 + 1;
                // nextPos < c2.length 表示右侧有相同的vnode，即新增在左侧；反之则新增在右侧
                const anchor = nextPos < c2.length ? c2[nextPos].el : null;
                while (i <= e2) {
                    patch(null, c2[i], container, parent, anchor);
                    i++;
                }
            }
        }
        else 
        // 右侧删减
        if (i > e2) {
            while (i <= e1) {
                hostRemove(c1[i].el);
                i++;
            }
        }
        else 
        // 中间对比
        {
            let toBePatched = 0; // 需要patch的节点个数
            let patched = 0; // 已经patch的节点个数
            // 收集新的vnode的key为一个map
            const keyToNewIndexMap = new Map();
            for (let index = i; index <= e2; index++) {
                const nextVnode = c2[index];
                toBePatched++;
                keyToNewIndexMap.set(nextVnode.key, index);
            }
            // 遍历prevChildren, 看在nextChildren中是否有对应的新节点
            // 有则patch，无则删除
            for (let index = i; index <= e1; index++) {
                const prevVnode = c1[index];
                // 若数量上已经有足够的节点被patch，则剩下的所有节点都是需要被删除的，不用寻找对应的新节点
                if (patched >= toBePatched) {
                    // console.log(333, prevVnode);
                    hostRemove(prevVnode.el);
                    continue;
                }
                let newIndex;
                if (prevVnode.key != null) {
                    newIndex = keyToNewIndexMap.get(prevVnode.key);
                }
                else {
                    for (let j = i; j <= e2; j++) {
                        const nextVnode = c2[j];
                        if (isSameVnode(prevVnode, nextVnode)) {
                            newIndex = j;
                            break;
                        }
                    }
                }
                if (newIndex !== undefined) {
                    const nextVnode = c2[newIndex];
                    patch(prevVnode, nextVnode, container, parent, null);
                    patched++;
                }
                else {
                    hostRemove(prevVnode.el);
                }
            }
        }
    }
    function unMountChildren(children) {
        children.forEach((childVnode) => {
            const { el } = childVnode;
            hostRemove(el);
        });
    }
    return {
        createApp: createAppApi(render)
    };
}

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, prevVal, nextVal) {
    if (isOn(key)) {
        const e = key.slice(2).toLowerCase();
        el.addEventListener(e, nextVal);
    }
    else {
        if (nextVal === undefined || nextVal === null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, nextVal);
        }
    }
}
function insert(el, container, anchor) {
    // container.appendChild(el)
    container.insertBefore(el, anchor);
}
function remove(el) {
    if (el.parentNode) {
        el.parentNode.removeChild(el);
    }
}
function setElementText(el, text) {
    // const newTextChild = document.createTextNode(text)
    // el.appendChild(newTextChild)
    el.textContent = text;
}
const option = {
    createElement,
    patchProp,
    insert,
    remove,
    setElementText
};
const renderer = createRenderer(option);
function createApp(...args) {
    return renderer.createApp(...args);
}

exports.createApp = createApp;
exports.createRenderer = createRenderer;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.isProxy = isProxy;
exports.isReactive = isReactive;
exports.isReadonly = isReadonly;
exports.isRef = isRef;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.reactive = reactive;
exports.readonly = readonly;
exports.ref = ref;
exports.renderSlot = renderSlot;
exports.shallowReadonly = shallowReadonly;
exports.unRef = unRef;
