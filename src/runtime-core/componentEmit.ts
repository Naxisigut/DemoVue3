import { toHandlerKey } from "../shared/index"

export function emit(instance, e, ...args){
  const { props } = instance
  const handlerName = toHandlerKey(e)
  const handler = props[handlerName]
  handler && handler(...args)
}