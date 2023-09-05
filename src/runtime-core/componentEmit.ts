import { hasOwn } from "../shared/index";

export function emit(instance, e){
  const { props } = instance
  const captalize = (str: string) => {
    return str[0].toUpperCase() + e.slice(1)
  }
  const toHandlerKey = (str: string) =>{
    return str ? `on${captalize(str)}` : '' 
  }

  const emitName = toHandlerKey(e)
  console.log(emitName);
  if(hasOwn(props, emitName)){
    props[emitName]()
  }
}