class ReactiveEffect{
  private fn: Function
  constructor(_fn){
    this.fn = _fn
  }
  run(){
    this.fn()
  }
}

export function effect(fn){
  const effect = new ReactiveEffect(fn)
  
}