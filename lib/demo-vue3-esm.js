function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children
    };
    return vnode;
}

const isObject = (val) => {
    return typeof val === 'object' && val !== null;
};

// 创建组件实例
function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type // component object, refer to "createVNode"
    };
    return component;
}
// 处理组件实例的属性
function setupComponent(instance) {
    // TODO init props
    // TODO init slots
    // setup & render
    // 非函数式组件
    setupStatefulComponent(instance);
}
// 处理组件实例的属性-执行setup
function setupStatefulComponent(instance) {
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
    const { type } = vnode;
    if (typeof type === 'string') {
        // 处理element
        processElement(vnode, container);
    }
    else if (isObject(type)) {
        // 处理组件
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    //创建dom => 添加属性 => 挂载子节点 => 挂载至容器节点
    const { type, props, children } = vnode;
    const el = document.createElement(type);
    for (const key in props) {
        if (Object.prototype.hasOwnProperty.call(props, key)) {
            el.setAttribute(key, props[key]);
        }
    }
    if (typeof children === 'string') {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        children.forEach((v) => {
            patch(v, el);
        });
    }
    container.appendChild(el);
}
function processComponent(vnode, container) {
    // 1. 初始化组件 2.更新组件
    mountComponent(vnode, container);
}
// 初始化组件
function mountComponent(vnode, container) {
    // 初始化组件实例 => 处理组件实例（添加各种属性） => 获取组件template转化的或render得到的element vNode
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}
// 执行组件实例的render
function setupRenderEffect(instance, container) {
    const subTree = instance.render(); // subtree is element type vnode
    patch(subTree, container);
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

export { createApp, h };
