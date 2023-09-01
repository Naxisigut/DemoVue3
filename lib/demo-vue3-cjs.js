'use strict';

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
    console.log(11, vnode);
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === 'string' ? 1 /* ShapeFlag.ELEMENT */ : 2 /* ShapeFlag.STATEFUL_COMPONENT */;
}

const publicPropertiesMap = {
    $el: (instance) => instance.vnode.el
};
const PublicInstanceProxyHandler = {
    get(target, key) {
        const { _: instance } = target;
        const { setupState, vnode } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        const getter = publicPropertiesMap[key];
        if (getter)
            return getter(instance);
    }
};

// 创建组件实例
function createComponentInstance(vnode) {
    const instance = {
        vnode,
        type: vnode.type // component object, refer to "createVNode"
    };
    return instance;
}
// 处理组件实例的属性
function setupComponent(instance) {
    // TODO init props
    // TODO init slots
    // init setup & render
    // 非函数式组件
    setupStatefulComponent(instance);
}
// 处理组件实例的属性-执行setup
function setupStatefulComponent(instance) {
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandler);
    const Component = instance.type;
    const { setup } = Component;
    if (setup) {
        const setupRes = setup(); // function/object
        handleSetupResult(instance, setupRes);
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
    const subTree = instance.render.call(proxy); // subtree is element type vnode
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
            el.setAttribute(key, props[key]);
        }
    }
    mountChildren(vnode, el);
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

exports.createApp = createApp;
exports.h = h;
