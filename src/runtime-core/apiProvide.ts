import { getCurrentInstance } from './getCurrentInstance';

export function provide(key, value){
  const instance = getCurrentInstance()
  if(!instance)return
  // console.log('provide', instance);
  let { provides, parent } = instance
  if(parent && provides === parent.provides){
    provides = instance.provides = Object.create(parent.provides)
  }
  provides[key] = value
}

export function inject(key, defaultVal?){
  const instance = getCurrentInstance()
  // console.log('inject', instance);
  // 这里可以对parent是否存在加一层判断，防止在顶层组件里调用inject
  const { provides: parentProvides } = instance.parent
  if(key in parentProvides)return parentProvides[key] // 对于原型上的属性，key in 返回true
  return typeof defaultVal === 'function' ? defaultVal() : defaultVal
}