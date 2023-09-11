let currComponent = null
export function setCurrentInstance(instance){
  currComponent = instance
}

export function getCurrentInstance(){
  return currComponent
}