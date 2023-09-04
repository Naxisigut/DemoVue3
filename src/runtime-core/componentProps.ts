export function initProps(instance, vnode){
  const { props } = vnode
  instance.props = props || {}
}