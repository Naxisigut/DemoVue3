import { processComponent } from './component';

export function render(vnode, container){
  patch(vnode, container)
}

function patch(vnode, container){
  // 处理组件
  processComponent(vnode, container)
}

