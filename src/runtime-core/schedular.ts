export function nextTick(fn){
  // 可以传入回调，可以await
  return fn ? Promise.resolve().then(fn) : Promise.resolve()
}

export const queue: any[] = []

export function queueJobs(job){
  // 优化1：优化job收集
  // 同一个数据变化多次/同一个component内的多个数据变化，触发的effect是同一个job，不进行重复收集；重复收集意味着多次执行
  if(!queue.includes(job)){
    queue.push(job)
  }
  queueFlush()
}

let isQueueFlushing = false
// 优化2：优化job执行时机
// 将job的执行延迟到微任务中一次性处理
function queueFlush(){
  if(isQueueFlushing)return
  isQueueFlushing = true
  console.log('flush');
  nextTick(()=>{
    isQueueFlushing = false
    let job
    while(job = queue.shift()){
      job && job()
    }
  })
}