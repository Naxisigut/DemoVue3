'use strict';

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children
    };
    return vnode;
}

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
    if (instance.render) {
        instance.render = Component.render;
    }
}

function render(vnode, container) {
    patch(vnode);
}
function patch(vnode, container) {
    // 处理组件
    processComponent(vnode);
}
function processComponent(vnode, container) {
    // 1. 初始化组件 2.更新组件
    mountComponent(vnode);
}
// 初始化组件
function mountComponent(vnode, container) {
    // 初始化组件实例 => 处理组件实例 => 获取组件vNode
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance);
}
// 执行组件实例的render
function setupRenderEffect(instance, container) {
    const subTree = instance.render(); // this is element type vnode
    patch(subTree);
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // component => vnodes(component object) => component instance => vnode(element) => real node
            const vnode = createVNode(rootComponent);
            render(vnode);
        }
    };
}

exports.createApp = createApp;
