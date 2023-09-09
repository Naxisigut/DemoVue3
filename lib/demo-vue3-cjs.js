'use strict';

const extend = Object.assign;
const isObject = (val) => {
    return typeof val === 'object' && val !== null;
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

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        shapeFlag: getShapeFlag(type),
        children,
        el: null,
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
function getShapeFlag(type) {
    return typeof type === 'string' ? 1 /* ShapeFlag.ELEMENT */ : 2 /* ShapeFlag.STATEFUL_COMPONENT */;
}

/**
 * 依赖存放的数据结构为：
 * targetDepsMap: (Map)
 *  --target: targetDeps (Map)
 *    -- key: keyDeps (Set)
 */
const targetDepsMap = new Map(); // 存放所有依赖的容器
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

/* proxy的get/set */
const createGetter = (isReadonly = false, isShallow = false) => {
    return function (target, key) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly;
        }
        else if (key === ReactiveFlags.IS_READONLY) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
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

var ReactiveFlags;
(function (ReactiveFlags) {
    ReactiveFlags["IS_REACTIVE"] = "--v--isReactive";
    ReactiveFlags["IS_READONLY"] = "--v--isReadonly";
})(ReactiveFlags || (ReactiveFlags = {}));
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
function createComponentInstance(vnode) {
    const instance = {
        name: vnode.type.name,
        vnode,
        type: vnode.type,
        emit: () => { },
        slots: {},
        props: {}
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
// 处理组件实例的属性-执行setup
function setupStatefulComponent(instance) {
    // 挂载proxy，即render中的this指向
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandler);
    const { props, type: Component, emit } = instance;
    const { setup } = Component;
    if (setup) {
        const setupRes = setup(shallowReadonly(props), { emit }); // function/object
        handleSetupResult(instance, setupRes || {});
    }
}
// 处理组件实例的属性-挂载setupState
function handleSetupResult(instance, setupRes) {
    if (typeof setupRes === 'object') {
        instance.setupState = setupRes;
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

function render(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    const { shapeFlag } = vnode;
    if (shapeFlag & 1 /* ShapeFlag.ELEMENT */) {
        // 处理element
        processElement(vnode, container);
    }
    else if (shapeFlag & 2 /* ShapeFlag.STATEFUL_COMPONENT */) {
        // 处理component initialVnode
        processComponent(vnode, container);
    }
}
function processComponent(initialVnode, container) {
    // 1. 初始化组件 2.更新组件
    mountComponent(initialVnode, container);
}
// 初始化组件
function mountComponent(initialVnode, container) {
    // 初始化组件实例 => 处理组件实例（添加各种属性） => 获取组件template转化/render得到的element vNode
    const instance = createComponentInstance(initialVnode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}
// 执行组件实例的render
function setupRenderEffect(instance, container) {
    const { proxy, vnode } = instance;
    // subtree is element type vnode
    // the result of component vnode render function must be a element vnode
    const subTree = instance.render.call(proxy);
    patch(subTree, container);
    vnode.el = subTree.el;
}
function processElement(vnode, container) {
    // 1. 初始化dom 2. 更新dom
    mountElement(vnode, container);
}
// 初始化dom
function mountElement(vnode, container) {
    //创建dom => 添加属性 => 挂载子节点 => 挂载至容器节点
    const { type, props } = vnode;
    const el = document.createElement(type);
    vnode.el = el;
    for (const key in props) {
        if (Object.prototype.hasOwnProperty.call(props, key)) {
            const val = props[key];
            if (isOn(key)) {
                const e = key.slice(2).toLowerCase();
                el.addEventListener(e, val);
            }
            else {
                el.setAttribute(key, val);
            }
        }
    }
    // children could be element/component vnode
    mountChildren(vnode, el);
    // outer dom appended will be later than its children dom
    container.appendChild(el);
}
function mountChildren(vnode, el) {
    const { children, shapeFlag } = vnode;
    if (shapeFlag & 4 /* ShapeFlag.TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ShapeFlag.ARRAY_CHILDREN */) {
        children.forEach((v) => {
            patch(v, el);
        });
    }
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // component => vnodes(component object) => component instance => vnode(element) => real node
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        }
    };
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
        return createVNode('div', {}, slot(scope));
    }
}

exports.createApp = createApp;
exports.h = h;
exports.renderSlot = renderSlot;
