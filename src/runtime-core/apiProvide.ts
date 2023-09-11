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
  const { provides: parentProvides } = instance.parent
  if(key in parentProvides)return parentProvides[key] // 对于原型上的属性，key in 返回true
  return typeof defaultVal === 'function' ? defaultVal() : defaultVal
}