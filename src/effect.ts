class ReactiveEffect{
  private fn: Function
  constructor(_fn){
    this.fn = _fn
  }
  run(){
    this.fn()
  }
}

let activeEffect
const targetDepsMap = new Map()
export function track(target, key){  
  let targetDeps = targetDepsMap.get(target) as Map<any, any>
  if(!targetDeps){
    targetDeps = new Map()
    targetDepsMap.set(target, targetDeps)
  } 
  
  let keyDeps = targetDeps.get(key)
  if(!keyDeps){
    keyDeps = new Set()
    targetDeps.set(key, keyDeps)
  }
  
  keyDeps.add(activeEffect)
  console.log('track', keyDeps);
}

export function trigger(target, key){
  const targetDeps = targetDepsMap.get(target)
  const keyDeps = targetDeps.get(key) as Set<ReactiveEffect>
  for (const dep of keyDeps) {
    console.log('trigger', keyDeps);
    dep.run()
  }
}

export function effect(fn){
  const _effect = new ReactiveEffect(fn)
  activeEffect = _effect
  _effect.run()
}