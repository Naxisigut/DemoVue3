export function initSlots(instance, vnode){
  const { children } = vnode
  instance.slots = children
}