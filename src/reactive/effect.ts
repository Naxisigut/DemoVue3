import { extend } from "../shared"

class ReactiveEffect{
  private fn: Function
  public schedular: any
  public onStop?: ()=>void
  public deps: Set<Set<ReactiveEffect>> // 包含此effect的副作用容器的集合
  public active: boolean
  constructor(_fn, option){
    this.fn = _fn
    extend(this, option)
    this.deps = new Set()
    this.active = true
  }
  run(){
    if(!this.active){
      // 若effect已处于stopped，则不用收集这个effect，直接执行fn即可
      return this.fn()
    }
    
    shouldTrack = true // 在真正需要track的时候打开shouldTrack
    activeEffect = this
    const res = this.fn()
    shouldTrack = false // fn执行完后关闭shouldTrack

    return res
  }
  stop(){
    if(this.active){
      clearEffect(this)
      this.active = false
      if(this.onStop)this.onStop()
    }
  }
}

/* 清除副作用 */
function clearEffect(effect){
  // 双向清空
  // 1,从容器中删除effect
  for (const keyDeps of effect.deps) {
    keyDeps.delete(effect)
  }
  // 2.清空effect中的容器
  effect.deps.length = 0
}

let activeEffect // 当前进行依赖收集的副作用函数
let shouldTrack = false // 判断当前能否收集依赖
function isTracking(){
  // 若activeEffect为undefined，说明此时不是通过effect进入，不进行依赖收集
  // 若shouldTrack为false, 说明此时的activeEffect为stopped状态，不进行依赖收集
  // 两者均为truthy时，表示正要track
  return shouldTrack && activeEffect
}

/**
 * 依赖存放的数据结构为：
 * targetDepsMap: (Map)
 *  --target: targetDeps (Map)
 *    -- key: keyDeps (Set)
 */
const targetDepsMap = new Map() // 存放所有依赖的容器

// 收集依赖
export function track(target, key){  
  if(!isTracking())return

  let targetDeps = targetDepsMap.get(target) as Map<any, any>
  // 若此对象没有收集过依赖，则初始化
  if(!targetDeps){
    targetDeps = new Map()
    targetDepsMap.set(target, targetDeps)
  } 
  
  let keyDeps = targetDeps.get(key)
  // 若此对象的此key没有收集过依赖，则初始化
  if(!keyDeps){
    keyDeps = new Set()
    targetDeps.set(key, keyDeps)
  }

  if(keyDeps.has(activeEffect))return
  keyDeps.add(activeEffect) // 收集依赖
  
  // 一个effect可能对应多个target的key，所以可能位于targetDepsMap的不同位置
  // 一个target的key也可能有多个effect
  activeEffect.deps.add(keyDeps) 
  // console.log('track', keyDeps);
}


// 触发依赖：在每次值set时触发对应的依赖
export function trigger(target, key){
  const targetDeps = targetDepsMap.get(target)
  const keyDeps = targetDeps.get(key) as Set<ReactiveEffect>
  // console.log(targetDepsMap);
  for (const effect of keyDeps) {
    // 在trigger时，schedular优先于run
    if(effect.schedular){
      effect.schedular()
    }else effect.run()
  }
}


// 清除
export function stop(runner){
  const effect = runner.effect as ReactiveEffect
  effect.stop()
}

// 副作用函数
export function effect(fn, option:any = {}){
  const _effect = new ReactiveEffect(fn, option)
  _effect.run()

  const runner:any = _effect.run.bind(_effect) // 绑定this
  runner.effect = _effect // 挂上runner对应的effect，方便通过runner查找effect
  return runner
}