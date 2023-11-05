export const queue: any[] = []

export function queueJobs(job){
  if(queue.includes(job)){
    queue.push(job)
  } 
  queueFlush()
}

let isQueueFlushing = false
// 将queue内所有的job一次性在微任务中处理完
function queueFlush(){
  if(isQueueFlushing)return
  isQueueFlushing = true

  Promise.resolve().then(()=>{
    isQueueFlushing = false
    let job
    while(job = queue.shift()){
      job && job()
      console.log(111);
    }
  })
}