class ReactiveEffect{
  private fn: Function
  public schedular: any
  public deps: Set<Set<ReactiveEffect>>
  constructor(_fn, schedular){
    this.fn = _fn
    this.schedular = schedular
    this.deps = new Set()
  }
  run(){
    activeEffect = this
    this.fn()
  }
}

let activeEffect // 当前进行依赖收集的副作用函数

/**
 * 依赖存放的数据结构为：
 * targetDepsMap: (Map)
 *  --target: targetDeps (Map)
 *    -- key: keyDeps (Set)
 */
const targetDepsMap = new Map() // 存放所有依赖的容器

// 收集依赖
export function track(target, key){  
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
  console.log(targetDepsMap);
  for (const effect of keyDeps) {
    // 在trigger时，schedular优先于run
    if(effect.schedular){
      effect.schedular()
    }else effect.run()
  }
}

export function stop(runner){
  const effect = runner.effect as ReactiveEffect
  for (const keyDeps of effect.deps) {
    keyDeps.delete(effect)
  }
  console.log('stop', targetDepsMap);
}

// 副作用函数
export function effect(fn, option:any = {}){
  const _effect = new ReactiveEffect(fn, option.schedular)
  _effect.run()

  const runner:any = _effect.run.bind(_effect) // 绑定this
  runner.effect = _effect // 挂上runner对应的effect，方便通过runner查找effect
  return runner
}